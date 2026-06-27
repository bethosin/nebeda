import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY?.trim();

if (!apiKey && process.env.NODE_ENV === "development") {
  console.warn("Resend email is not configured: RESEND_API_KEY is missing.");
}

const resend = apiKey ? new Resend(apiKey) : null;

const requiredEmailEnvironmentKeys = [
  "RESEND_API_KEY",
  "EMAIL_FROM_NAME",
  "EMAIL_FROM_ADDRESS",
  "BRAND_NOTIFICATION_EMAIL",
];

const getMissingEmailConfigKeys = () =>
  requiredEmailEnvironmentKeys.filter((key) => !process.env[key]?.trim());

const emailConfigIsReady = () => getMissingEmailConfigKeys().length === 0;

export { emailConfigIsReady, getMissingEmailConfigKeys };
export default resend;
