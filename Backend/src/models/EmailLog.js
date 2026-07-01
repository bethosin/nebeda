import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    recipient: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    template: { type: String, required: true, trim: true, default: "general" },
    status: { type: String, enum: ["Sent", "Failed"], required: true },
    provider: { type: String, default: "Resend", trim: true },
    error: { type: String, trim: true, maxlength: 1000 },
    messageId: { type: String, trim: true },
    sentAt: { type: Date },
  },
  { timestamps: true },
);

emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ recipient: 1, createdAt: -1 });

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
