import multer from "multer";

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const storage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error("Only jpeg, jpg, png, and webp image files are allowed"));
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
});

const uploadProductImages = upload.array("images", 6);
const uploadCustomOrderImages = upload.array("inspirationImages", 3);

const handleUploadErrors = (err, _req, res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400);
    next(new Error(err.message));
    return;
  }

  res.status(400);
  next(err);
};

export {
  handleUploadErrors,
  uploadCustomOrderImages,
  uploadProductImages,
};
