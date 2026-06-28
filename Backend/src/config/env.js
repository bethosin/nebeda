const requiredEnvironmentKeys = [
  "NODE_ENV",
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLIENT_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_UNSIGNED_UPLOAD_PRESET",
  "RESEND_API_KEY",
  "EMAIL_FROM_NAME",
  "EMAIL_FROM_ADDRESS",
  "BRAND_NOTIFICATION_EMAIL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "ENABLE_MAINTENANCE_ROUTES",
];

const getMissingEnvironmentKeys = () =>
  requiredEnvironmentKeys.filter((key) => !process.env[key]?.trim());

const validateEnvironment = () => {
  const missingKeys = getMissingEnvironmentKeys();

  if (missingKeys.length) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(", ")}.`);
  }
};

export { getMissingEnvironmentKeys, validateEnvironment };
