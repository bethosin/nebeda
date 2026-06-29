import mongoose from "mongoose";

import { calculateShipping } from "../config/shipping.js";
import Order, { orderStatuses, paymentStatuses } from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  orderNotificationEmail,
  orderPaymentStatusUpdateEmail,
  orderReceivedEmail,
  orderStatusUpdateEmail,
} from "../utils/emailTemplates.js";
import { EMAIL_DELIVERY_WARNING, sendEmailSafely } from "../utils/sendEmail.js";

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const validateOrderPayload = (payload) => {
  const requiredCustomerFields = ["fullName", "email"];
  const requiredShippingFields = ["shippingCountry", "addressLine1", "city", "country"];

  const missingCustomer = requiredCustomerFields.find((field) => !payload.customer?.[field]);
  if (missingCustomer) return `${missingCustomer} is required`;

  if (!validateEmail(payload.customer.email)) return "Please provide a valid email address";

  const missingShipping = requiredShippingFields.find((field) => !payload.shipping?.[field]);
  if (missingShipping) return `${missingShipping} is required`;

  if (!Array.isArray(payload.items) || !payload.items.length) {
    return "Order must include at least one cart item";
  }

  const invalidItem = payload.items.find(
    (item) =>
      !mongoose.Types.ObjectId.isValid(item.productId) ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1,
  );
  if (invalidItem) return "Each order item must include a valid product and quantity";

  return null;
};

const createOrder = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Please login or create an account to complete your order.");
  }

  const payload = {
    customer: req.body.customer,
    shipping: req.body.shipping,
    items: req.body.items,
  };
  const validationError = validateOrderPayload(payload);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const productIds = [...new Set(payload.items.map((item) => item.productId))];
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  }).lean();
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));

  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error("One or more products are unavailable. Please refresh your cart.");
  }

  const items = payload.items.map((item) => {
    const product = productsById.get(item.productId);
    const numericPrice = Number(product.numericPrice);
    const quantity = Number(item.quantity);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      res.status(400);
      throw new Error(`${product.name} does not have a valid checkout price.`);
    }

    return {
      product: product._id,
      name: product.name,
      image: product.mainImage?.url || product.images?.[0]?.url || "",
      price: product.price,
      numericPrice,
      currency: product.currency === "EUR" ? "EUR" : "GBP",
      quantity,
      subtotal: numericPrice * quantity,
    };
  });
  const orderCurrencies = new Set(items.map((item) => item.currency));

  if (orderCurrencies.size > 1) {
    res.status(400);
    throw new Error("Mixed GBP and EUR products cannot be checked out together.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const currency = [...orderCurrencies][0] || "GBP";
  const shippingResult = calculateShipping({
    country: payload.shipping.shippingCountry || payload.shipping.country,
    subtotal,
    requestedMethod: payload.shipping.shippingMethod,
    currency,
  });

  if (!shippingResult.supported || shippingResult.quoteRequired || !shippingResult.quote) {
    res.status(400);
    throw new Error("Shipping quote required.");
  }

  const shipping = {
    ...payload.shipping,
    shippingMethod: shippingResult.quote.shippingMethod,
    shippingCarrier: shippingResult.quote.shippingCarrier,
    shippingCost: shippingResult.quote.shippingCost,
    shippingRegion: shippingResult.quote.shippingRegion,
    estimatedDelivery: shippingResult.quote.estimatedDelivery,
  };
  const deliveryFee = shippingResult.quote.shippingCost;
  const order = await Order.create({
    user: req.user._id,
    customer: payload.customer,
    shipping,
    items,
    currency,
    totals: {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    },
    paymentProvider: "Stripe",
  });

  const emailResults = await Promise.all([
    sendEmailSafely(orderReceivedEmail(order)),
    sendEmailSafely(orderNotificationEmail(order)),
  ]);
  const emailWarning = emailResults.includes(false) ? EMAIL_DELIVERY_WARNING : undefined;

  res.status(201).json({
    success: true,
    message: "Order created successfully.",
    order,
    data: order,
    emailWarning,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id, isArchived: false })
    .sort("-createdAt")
    .lean();

  res.json({
    success: true,
    count: orders.length,
    orders,
    data: orders,
  });
});

const getMyOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid order id.");
  }

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
    isArchived: false,
  }).lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  res.json({
    success: true,
    order,
    data: order,
  });
});

const getAdminOrderStats = async (baseQuery = { isArchived: false }) => {
  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    pendingPayments,
    paidOrders,
    revenueRows,
  ] = await Promise.all([
    Order.countDocuments(baseQuery),
    Order.countDocuments({ ...baseQuery, orderStatus: "Pending" }),
    Order.countDocuments({ ...baseQuery, orderStatus: "Confirmed" }),
    Order.countDocuments({ ...baseQuery, orderStatus: "Processing" }),
    Order.countDocuments({ ...baseQuery, orderStatus: "Shipped" }),
    Order.countDocuments({ ...baseQuery, orderStatus: "Delivered" }),
    Order.countDocuments({ ...baseQuery, orderStatus: "Cancelled" }),
    Order.countDocuments({ ...baseQuery, paymentStatus: "Pending" }),
    Order.countDocuments({ ...baseQuery, paymentStatus: "Paid" }),
    Order.aggregate([
      { $match: { ...baseQuery, paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totals.total" } } },
    ]),
  ]);

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    pendingPayments,
    paidOrders,
    totalRevenue: revenueRows[0]?.totalRevenue || 0,
  };
};

const getAdminOrders = asyncHandler(async (req, res) => {
  const { search = "", orderStatus, paymentStatus, startDate, endDate } = req.query;
  const query = { isArchived: false };

  if (orderStatus && orderStatus !== "All") query.orderStatus = orderStatus;
  if (paymentStatus && paymentStatus !== "All") query.paymentStatus = paymentStatus;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    const safeSearch = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { "customer.fullName": safeSearch },
      { "customer.email": safeSearch },
      { "customer.whatsappNumber": safeSearch },
      { "items.name": safeSearch },
      ...(mongoose.Types.ObjectId.isValid(search) ? [{ _id: search }] : []),
    ];
  }

  const [orders, stats] = await Promise.all([
    Order.find(query).sort("-createdAt").limit(200).lean(),
    getAdminOrderStats({ isArchived: false }),
  ]);

  res.json({
    success: true,
    count: orders.length,
    orders,
    data: orders,
    stats,
  });
});

const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, isArchived: false }).lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  res.json({
    success: true,
    order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, adminNotes } = req.body;

  if (!orderStatuses.includes(orderStatus)) {
    res.status(400);
    throw new Error(`${orderStatus} is not a valid order status.`);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  const previousStatus = order.orderStatus;
  order.orderStatus = orderStatus;
  if (adminNotes !== undefined) order.adminNotes = adminNotes;
  await order.save();

  const emailResult =
    previousStatus !== order.orderStatus
      ? await sendEmailSafely(orderStatusUpdateEmail(order))
      : null;

  res.json({
    success: true,
    message: "Order status updated successfully.",
    order,
    emailWarning: emailResult === false ? EMAIL_DELIVERY_WARNING : undefined,
  });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, paymentProvider, adminNotes } = req.body;

  if (!paymentStatuses.includes(paymentStatus)) {
    res.status(400);
    throw new Error(`${paymentStatus} is not a valid payment status.`);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  const previousPaymentStatus = order.paymentStatus;

  if (
    order.paymentProvider === "Stripe" &&
    paymentProvider &&
    paymentProvider !== "Stripe"
  ) {
    res.status(403);
    throw new Error("The payment provider cannot be changed for a Stripe order.");
  }

  if (
    paymentStatus === "Paid" &&
    order.paymentProvider === "Stripe" &&
    previousPaymentStatus !== "Paid"
  ) {
    res.status(403);
    throw new Error("Stripe payments can only be confirmed by the verified webhook.");
  }

  order.paymentStatus = paymentStatus;
  if (paymentProvider) order.paymentProvider = paymentProvider;
  if (adminNotes !== undefined) order.adminNotes = adminNotes;
  await order.save();

  const emailResult =
    previousPaymentStatus !== order.paymentStatus
      ? await sendEmailSafely(orderPaymentStatusUpdateEmail(order))
      : null;

  res.json({
    success: true,
    message: "Payment status updated successfully.",
    order,
    emailWarning: emailResult === false ? EMAIL_DELIVERY_WARNING : undefined,
  });
});

const updateAdminOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  const previousStatus = order.orderStatus;
  const previousPaymentStatus = order.paymentStatus;
  const {
    orderStatus,
    paymentStatus,
    paymentProvider,
    adminNotes,
    trackingNumber,
    trackingCarrier,
    trackingUrl,
  } = req.body;

  if (
    order.paymentProvider === "Stripe" &&
    paymentProvider &&
    paymentProvider !== "Stripe"
  ) {
    res.status(403);
    throw new Error("The payment provider cannot be changed for a Stripe order.");
  }

  if (orderStatus) {
    if (!orderStatuses.includes(orderStatus)) {
      res.status(400);
      throw new Error(`${orderStatus} is not a valid order status.`);
    }
    order.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    if (!paymentStatuses.includes(paymentStatus)) {
      res.status(400);
      throw new Error(`${paymentStatus} is not a valid payment status.`);
    }
    if (
      paymentStatus === "Paid" &&
      order.paymentProvider === "Stripe" &&
      previousPaymentStatus !== "Paid"
    ) {
      res.status(403);
      throw new Error("Stripe payments can only be confirmed by the verified webhook.");
    }
    order.paymentStatus = paymentStatus;
  }

  if (paymentProvider) order.paymentProvider = paymentProvider;
  if (adminNotes !== undefined) order.adminNotes = adminNotes;
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    res.status(400);
    throw new Error("Tracking URL must start with http:// or https://.");
  }
  if (trackingNumber !== undefined) order.shipping.trackingNumber = trackingNumber;
  if (trackingCarrier !== undefined) order.shipping.trackingCarrier = trackingCarrier;
  if (trackingUrl !== undefined) order.shipping.trackingUrl = trackingUrl;

  await order.save();

  const emailResults = await Promise.all([
    previousStatus !== order.orderStatus ? sendEmailSafely(orderStatusUpdateEmail(order)) : null,
    previousPaymentStatus !== order.paymentStatus
      ? sendEmailSafely(orderPaymentStatusUpdateEmail(order))
      : null,
  ]);

  res.json({
    success: true,
    message: "Order updated successfully.",
    order,
    data: order,
    emailWarning: emailResults.includes(false) ? EMAIL_DELIVERY_WARNING : undefined,
  });
});

const archiveOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  order.isArchived = true;
  await order.save();

  res.json({
    success: true,
    message: "Order archived successfully.",
    order,
  });
});

const getOrderProductCount = asyncHandler(async (_req, res) => {
  const totalProducts = await Product.countDocuments({ isActive: true });
  res.json({ success: true, totalProducts });
});

export {
  archiveOrder,
  createOrder,
  getAdminOrderById,
  getAdminOrders,
  getMyOrderById,
  getMyOrders,
  getOrderProductCount,
  updateAdminOrder,
  updateOrderStatus,
  updatePaymentStatus,
};
