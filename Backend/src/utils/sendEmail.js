import resend, { emailConfigIsReady } from "../config/email.js";
import EmailLog from "../models/EmailLog.js";

const EMAIL_DELIVERY_WARNING = "Action completed, but email notification could not be delivered.";

const getFromAddress = () => {
  const fromName = process.env.EMAIL_FROM_NAME?.trim();
  const fromAddress = process.env.EMAIL_FROM_ADDRESS?.trim();

  return fromAddress ? `${fromName} <${fromAddress}>` : undefined;
};

const isResendTestSenderError = (error) =>
  /testing emails|test sender|verify (a|your) domain|verified recipient|only send.*your own email/i.test(
    error?.message || ""
  );

const writeEmailLogs = async ({ recipients, subject, template, status, error, messageId }) => {
  try {
    await EmailLog.insertMany(
      recipients.map((recipient) => ({
        recipient,
        subject,
        template,
        status,
        provider: "Resend",
        error: error?.slice(0, 1000),
        messageId,
        sentAt: status === "Sent" ? new Date() : undefined,
      })),
      { ordered: false },
    );
  } catch (logError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Email log write failed:", logError.message);
    }
  }
};

const sendEmail = async ({ to, subject, text, html, template = "general" }) => {
  const recipients = (Array.isArray(to) ? to : [to])
    .filter(Boolean)
    .map((recipient) => String(recipient).trim().toLowerCase());

  if (recipients.length === 0) {
    throw new Error("Email recipient is required.");
  }

  if (!subject?.trim()) {
    throw new Error("Email subject is required.");
  }

  if (!emailConfigIsReady() || !resend) {
    throw new Error(
      "Resend email configuration is incomplete. Check the required email environment variables."
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Sending email with Resend:", {
      to: recipients,
      subject,
      template,
    });
  }

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: recipients,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Resend rejected the email request.");
  }

  return data;
};

const sendEmailSafely = async (payload) => {
  try {
    return await sendEmail(payload);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Email send failed:", error.message);
    }
    return false;
  }
};

export { EMAIL_DELIVERY_WARNING, isResendTestSenderError, sendEmail, sendEmailSafely };
