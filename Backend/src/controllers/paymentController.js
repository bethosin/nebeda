import mongoose from "mongoose";

import { getStripeClient } from "../config/stripe.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  paidOrderNotificationEmail,
  paymentConfirmationEmail,
} from "../utils/emailTemplates.js";
import { sendEmailSafely } from "../utils/sendEmail.js";

const getClientUrl = () => {
  const clientUrl = process.env.CLIENT_URL?.trim().replace(/\/$/, "");
  if (!clientUrl) throw new Error("CLIENT_URL is required for Stripe Checkout redirects.");
  return clientUrl;
};

const getOrderCurrency = (order) => {
  const currencies = new Set(
    order.items.map((item) => (item.currency === "EUR" ? "EUR" : "GBP")),
  );

  if (currencies.size > 1) {
    throw new Error("Mixed-currency orders cannot be paid in one Stripe Checkout session.");
  }

  return [...currencies][0] || order.currency || "GBP";
};

const createLineItems = (order, currency) => {
  const lineItems = order.items.map((item) => {
    const unitAmount = Math.round(Number(item.numericPrice) * 100);
    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) {
      throw new Error(`A valid payment price is required for ${item.name}.`);
    }

    const image = typeof item.image === "string" && item.image.startsWith("https://")
      ? [item.image]
      : undefined;

    return {
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: item.name,
          ...(image && { images: image }),
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    };
  });

  const shippingCost = Number(order.shipping?.shippingCost ?? order.totals?.deliveryFee ?? 0);

  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: order.shipping?.shippingMethod || "Shipping",
          description: order.shipping?.estimatedDelivery || undefined,
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  return lineItems;
};

const getReusableSession = async (stripe, order) => {
  if (!order.stripeSessionId) return null;

  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    return session.status === "open" && session.url ? session : null;
  } catch (_error) {
    return null;
  }
};

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(400);
    throw new Error("A valid orderId is required.");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    isArchived: false,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found or does not belong to this account.");
  }
  if (order.paymentStatus === "Paid") {
    res.status(409);
    throw new Error("This order has already been paid.");
  }
  if (order.orderStatus === "Cancelled") {
    res.status(409);
    throw new Error("Cancelled orders cannot be paid.");
  }
  if (!order.items?.length) {
    res.status(400);
    throw new Error("This order does not contain any items.");
  }

  const stripe = getStripeClient();
  const reusableSession = await getReusableSession(stripe, order);
  if (reusableSession) {
    res.json({ success: true, checkoutUrl: reusableSession.url });
    return;
  }

  let currency;
  try {
    currency = getOrderCurrency(order);
  } catch (error) {
    res.status(400);
    throw error;
  }
  const metadata = {
    orderId: order._id.toString(),
    userId: req.user._id.toString(),
    customerEmail: order.customer.email,
  };
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: order.customer.email,
      line_items: createLineItems(order, currency),
      success_url: `${getClientUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getClientUrl()}/payment/cancel?orderId=${order._id}`,
      metadata,
      payment_intent_data: { metadata },
    },
    { idempotencyKey: `checkout-${order._id}-${order.updatedAt.getTime()}` },
  );

  if (!session.url) {
    res.status(502);
    throw new Error("Stripe did not return a Checkout URL. Please try again.");
  }

  order.stripeSessionId = session.id;
  order.paymentProvider = "Stripe";
  order.currency = currency;
  await order.save();

  res.json({ success: true, checkoutUrl: session.url });
});

const handleCompletedCheckout = async (session) => {
  const orderId = session.metadata?.orderId;
  if (!mongoose.Types.ObjectId.isValid(orderId) || session.payment_status !== "paid") return;

  const order = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: { $ne: "Paid" }, isArchived: false },
    {
      $set: {
        paymentStatus: "Paid",
        orderStatus: "Confirmed",
        paymentProvider: "Stripe",
        paidAt: new Date(),
        stripeSessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
        paymentFailureReason: "",
      },
    },
    { new: true },
  );

  if (!order) return;
  await Promise.all([
    sendEmailSafely(paymentConfirmationEmail(order)),
    sendEmailSafely(paidOrderNotificationEmail(order)),
  ]);
};

const handleExpiredCheckout = async (session) => {
  const orderId = session.metadata?.orderId;
  if (!mongoose.Types.ObjectId.isValid(orderId)) return;

  await Order.updateOne(
    { _id: orderId, paymentStatus: "Pending" },
    { $set: { paymentFailureReason: "Stripe Checkout expired before payment was completed." } },
  );
};

const handleFailedPayment = async (paymentIntent) => {
  const orderId = paymentIntent.metadata?.orderId;
  if (!mongoose.Types.ObjectId.isValid(orderId)) return;

  const reason = paymentIntent.last_payment_error?.message || "Stripe payment failed.";
  await Order.updateOne(
    { _id: orderId, paymentStatus: { $ne: "Paid" } },
    {
      $set: {
        paymentStatus: "Failed",
        paymentProvider: "Stripe",
        paymentIntentId: paymentIntent.id,
        paymentFailureReason: reason.slice(0, 500),
      },
    },
  );
};

const stripeWebhookHandler = async (req, res, next) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    const signature = req.headers["stripe-signature"];

    if (!webhookSecret) {
      res.status(503);
      throw new Error("Stripe webhook is not configured.");
    }
    if (!signature) {
      res.status(400);
      throw new Error("Stripe signature is missing.");
    }

    const stripe = getStripeClient();
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (_error) {
      res.status(400);
      throw new Error("Stripe webhook signature verification failed.");
    }

    if (event.type === "checkout.session.completed") {
      await handleCompletedCheckout(event.data.object);
    } else if (event.type === "checkout.session.expired") {
      await handleExpiredCheckout(event.data.object);
    } else if (event.type === "payment_intent.payment_failed") {
      await handleFailedPayment(event.data.object);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

export { createCheckoutSession, stripeWebhookHandler };
