import express from "express";

import { emailConfigIsReady, getMissingEmailConfigKeys } from "../config/email.js";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isResendTestSenderError, sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Nebeda Threads API is running",
    environment: process.env.NODE_ENV,
  });
});

router.get("/email", (_req, res) => {
  if (!emailConfigIsReady()) {
    const missingKeys = getMissingEmailConfigKeys();
    return res.status(503).json({
      success: false,
      ready: false,
      message: `Resend email configuration is incomplete. Missing: ${missingKeys.join(", ")}.`,
      missingKeys,
    });
  }

  return res.json({
    success: true,
    ready: true,
    message: "Resend email configuration is ready",
  });
});

router.post(
  "/email-test",
  protect,
  asyncHandler(async (req, res) => {
    const to = req.body.to?.trim();

    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      res.status(400);
      throw new Error("A valid test email recipient is required.");
    }

    let result;

    try {
      result = await sendEmail({
        to,
        subject: "Nebeda Threads Email Test",
        text: "If you received this email, Nebeda Threads email notifications are working through Resend.",
        html: "<p>If you received this email, Nebeda Threads email notifications are working through Resend.</p>",
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Resend email test failed:", error.message);
      }

      if (isResendTestSenderError(error)) {
        return res.status(502).json({
          success: false,
          message:
            "Resend rejected this recipient. Confirm the email is verified in Resend or verify a domain before production.",
        });
      }

      return res.status(502).json({
        success: false,
        message: "Resend rejected the email request. Check sender and recipient configuration.",
      });
    }

    return res.json({
      success: true,
      message: "Test email sent successfully.",
      emailId: result?.id,
    });
  })
);

export default router;
