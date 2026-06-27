import resend, { emailConfigIsReady } from "../config/email.js";

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

const sendEmail = async ({ to, subject, text, html }) => {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : to;

  if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
    throw new Error("Email recipient is required.");
  }

  if (!subject?.trim()) {
    throw new Error("Email subject is required.");
  }

  if (!emailConfigIsReady() || !resend) {
    throw new Error(
      "Resend email configuration is incomplete. Check RESEND_API_KEY, EMAIL_FROM_ADDRESS, and BRAND_NOTIFICATION_EMAIL."
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Sending email with Resend:", {
      to: recipients,
      subject,
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
