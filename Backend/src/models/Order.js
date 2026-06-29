import mongoose from "mongoose";

const orderStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
const paymentProviders = ["Stripe", "Manual", "Not Set"];

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    numericPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["GBP", "EUR"],
      default: "GBP",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    whatsappNumber: { type: String, trim: true },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    shippingCountry: { type: String, required: true, trim: true },
    shippingMethod: { type: String, trim: true },
    shippingCarrier: { type: String, trim: true },
    shippingCost: { type: Number, default: 0, min: 0 },
    shippingRegion: { type: String, trim: true },
    estimatedDelivery: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    trackingCarrier: { type: String, trim: true },
    trackingUrl: { type: String, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    stateCounty: { type: String, trim: true },
    postcode: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const totalsSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customer: {
      type: customerSchema,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Order must include at least one item",
      },
    },
    shipping: {
      type: shippingSchema,
      required: true,
    },
    totals: {
      type: totalsSchema,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: orderStatuses,
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: paymentStatuses,
      default: "Pending",
    },
    paymentProvider: {
      type: String,
      enum: paymentProviders,
      default: "Not Set",
    },
    currency: {
      type: String,
      enum: ["GBP", "EUR"],
      default: "GBP",
    },
    paidAt: { type: Date },
    stripeSessionId: { type: String, trim: true },
    paymentIntentId: { type: String, trim: true },
    paymentFailureReason: { type: String, trim: true, maxlength: 500 },
    adminNotes: { type: String, trim: true },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ stripeSessionId: 1 }, { sparse: true });
orderSchema.index({ paymentIntentId: 1 }, { sparse: true });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export { orderStatuses, paymentProviders, paymentStatuses };
export default Order;
