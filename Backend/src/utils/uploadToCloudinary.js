import { cloudinary } from "../config/cloudinary.js";

const UNSIGNED_UPLOAD_PRESET = process.env.CLOUDINARY_UNSIGNED_UPLOAD_PRESET?.trim();

const getUploadOptions = (folder) => {
  return {
    folder,
    resource_type: "image",
  };
};

const normalizeCloudinaryError = (error) => {
  const uploadError = new Error(
    error?.message || "Cloudinary image upload failed. Please check the unsigned upload preset and folder permissions."
  );
  uploadError.statusCode = error?.http_code || 502;
  uploadError.originalMessage = error?.message;

  return uploadError;
};

const uploadToCloudinary = ({ buffer, folder, alt }) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.unsigned_upload_stream(
      UNSIGNED_UPLOAD_PRESET,
      getUploadOptions(folder),
      (error, result) => {
        if (error) {
          reject(normalizeCloudinaryError(error));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          alt,
        });
      }
    );

    uploadStream.end(buffer);
  });

export default uploadToCloudinary;
