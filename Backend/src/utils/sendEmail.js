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
    error?.message || "",
  );

const normalizeRecipients = (to) =>
  (Array.isArray(to) ? to : [to])
    .filter(Boolean)
    .map((recipient) => String(recipient).trim().toLowerCase());

const sendOneEmail = async ({
  recipient, subject, text, html, template, relatedUser, relatedOrder,
  relatedCustomOrder, logId,
}) => {
  let log;

  if (logId) {
    log = await EmailLog.findById(logId).select("+text +html");
    if (!log) throw new Error("Email log not found.");
    log.status = "Pending";
    log.error = undefined;
    log.lastAttemptAt = new Date();
    log.retryCount += 1;
    await log.save();
  } else {
    log = await EmailLog.create({
      recipient, subject, template, status: "Pending", provider: "Resend",
      text, html, relatedUser, relatedOrder, relatedCustomOrder,
      lastAttemptAt: new Date(),
    });
  }

  try {
    if (!emailConfigIsReady() || !resend) {
      throw new Error("Resend email configuration is incomplete.");
    }

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      replyTo: process.env.EMAIL_REPLY_TO?.trim(),
      to: recipient,
      subject,
      text,
      html,
    });
    if (error) throw new Error(error.message || "Resend rejected the email request.");

    log.status = "Sent";
    log.messageId = data?.id;
    log.sentAt = new Date();
    log.error = undefined;
    await log.save();
    return data;
  } catch (error) {
    log.status = "Failed";
    log.error = String(error.message || "Email delivery failed.").slice(0, 1000);
    await log.save();
    throw error;
  }
};

const sendEmail = async ({
  to, subject, text, html, template = "general", relatedUser, relatedOrder,
  relatedCustomOrder, logId,
}) => {
  const recipients = normalizeRecipients(to);
  if (!recipients.length) throw new Error("Email recipient is required.");
  if (!subject?.trim()) throw new Error("Email subject is required.");
  if (logId && recipients.length !== 1) {
    throw new Error("A logged email retry must have exactly one recipient.");
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Sending email with Resend:", { to: recipients, subject, template });
  }

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendOneEmail({
        recipient, subject, text, html, template, relatedUser, relatedOrder,
        relatedCustomOrder, logId,
      }),
    ),
  );
  const failed = results.find((result) => result.status === "rejected");
  if (failed) throw failed.reason;
  return results.length === 1 ? results[0].value : results.map((result) => result.value);
};

const retryEmailLog = async (log) =>
  sendEmail({
    to: log.recipient,
    subject: log.subject,
    text: log.text,
    html: log.html,
    template: log.template,
    relatedUser: log.relatedUser,
    relatedOrder: log.relatedOrder,
    relatedCustomOrder: log.relatedCustomOrder,
    logId: log._id,
  });

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

export {
  EMAIL_DELIVERY_WARNING,
  isResendTestSenderError,
  retryEmailLog,
  sendEmail,
  sendEmailSafely,
};
