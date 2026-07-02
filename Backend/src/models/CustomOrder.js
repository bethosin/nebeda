import mongoose from "mongoose";

const genders = ["Men", "Women", "Couple"];
const orderTypes = ["Ready to Wear", "Bespoke", "Wedding"];
const shippingCountries = ["United Kingdom", "Nigeria", "Other"];
const orderStatuses = [
  "New",
  "Reviewed",
  "In Progress",
  "Awaiting Payment",
  "Paid",
  "Completed",
  "Cancelled",
];
const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
const paymentProviders = ["Stripe", "Manual", "Not Set"];

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const measurementFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    value: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const measurementsSchema = new mongoose.Schema(
  {
    gender: { type: String, enum: ["Male", "Female"] },
    unit: { type: String, enum: ["cm", "inches"], default: "cm" },
    fields: { type: [measurementFieldSchema], default: undefined },
    // Legacy fields remain readable while existing records are migrated naturally.
    chestBust: { type: String, trim: true },
    waist: { type: String, trim: true },
    hip: { type: String, trim: true },
    shoulder: { type: String, trim: true },
    sleeveLength: { type: String, trim: true },
    topLength: { type: String, trim: true },
    trouserSkirtLength: { type: String, trim: true },
    height: { type: String, trim: true },
    additionalNotes: { type: String, trim: true },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    shippingCountry: {
      type: String,
      enum: shippingCountries,
    },
    shippingMethod: { type: String, trim: true },
    addressLine1: {
      type: String,
      trim: true,
    },
    addressLine2: { type: String, trim: true },
    city: {
      type: String,
      trim: true,
    },
    stateCounty: { type: String, trim: true },
    postcode: { type: String, trim: true },
    country: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const customOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    whatsappNumber: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
      maxlength: [30, "WhatsApp number cannot exceed 30 characters"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: genders,
    },
    outfitType: {
      type: String,
      required: [true, "Outfit type is required"],
      trim: true,
    },
    orderType: {
      type: String,
      required: [true, "Order type is required"],
      enum: orderTypes,
    },
    fabricPreference: { type: String, trim: true },
    occasion: { type: String, trim: true },
    deadline: { type: Date },
    styleNotes: { type: String, trim: true },
    measurements: {
      type: measurementsSchema,
      required: [true, "Measurements are required"],
    },
    shipping: {
      type: shippingSchema,
      required: false,
    },
    inspirationImages: {
      type: [imageSchema],
      default: [],
    },
    orderStatus: {
      type: String,
      enum: orderStatuses,
      default: "New",
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
    estimatedPrice: { type: String, trim: true },
    stripeSessionId: { type: String, trim: true },
    paymentIntentId: { type: String, trim: true },
    paidAt: { type: Date },
    adminNotes: { type: String, trim: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

customOrderSchema.index({ user: 1, createdAt: -1 });
customOrderSchema.index({ email: 1 });
customOrderSchema.index({ whatsappNumber: 1 });
customOrderSchema.index({ orderStatus: 1 });
customOrderSchema.index({ paymentStatus: 1 });
customOrderSchema.index({ createdAt: -1 });
customOrderSchema.index({
  fullName: "text",
  email: "text",
  whatsappNumber: "text",
  outfitType: "text",
  occasion: "text",
});

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);

export {
  genders,
  orderStatuses,
  orderTypes,
  paymentProviders,
  paymentStatuses,
  shippingCountries,
};
export default CustomOrder;
