import mongoose from "mongoose";

const enquiryTypes = [
  "Custom Order",
  "Ready to Wear",
  "Delivery",
  "Styling Consultation",
  "General Enquiry",
];
const enquiryStatuses = ["New", "Read", "Replied", "Archived"];

const enquirySchema = new mongoose.Schema(
  {
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
      trim: true,
      maxlength: [30, "WhatsApp number cannot exceed 30 characters"],
    },
    enquiryType: {
      type: String,
      required: [true, "Enquiry type is required"],
      enum: enquiryTypes,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [3000, "Message cannot exceed 3000 characters"],
    },
    status: {
      type: String,
      enum: enquiryStatuses,
      default: "New",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    handledAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

enquirySchema.index({ email: 1 });
enquirySchema.index({ whatsappNumber: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({
  fullName: "text",
  email: "text",
  whatsappNumber: "text",
  enquiryType: "text",
  message: "text",
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export { enquiryStatuses, enquiryTypes };
export default Enquiry;
