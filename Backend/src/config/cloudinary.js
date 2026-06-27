import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Cloudinary configuration is missing. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

if (process.env.NODE_ENV === "development") {
  console.log("Cloudinary config loaded:", {
    cloudName: Boolean(cloudName),
    apiKey: Boolean(apiKey),
    apiSecret: Boolean(apiSecret),
    unsignedUploadPreset: process.env.CLOUDINARY_UNSIGNED_UPLOAD_PRESET?.trim(),
  });
}

export { cloudinary };
export default cloudinary;
