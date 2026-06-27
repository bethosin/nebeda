import express from "express";

import {
  adminGetProductById,
  adminGetProducts,
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProductById,
  getProductBySlug,
  getProducts,
  permanentlyDeleteProduct,
  restoreProduct,
  updateProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleUploadErrors, uploadProductImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/admin/all", protect, adminGetProducts);
router.get("/admin/:id", protect, adminGetProductById);
router.get("/slug/:slug", getProductBySlug);
router.patch("/:id/restore", protect, restoreProduct);
router.delete("/:id/permanent", protect, permanentlyDeleteProduct);
router.delete("/:id/images", protect, deleteProductImage);

router
  .route("/")
  .get(getProducts)
  .post(protect, uploadProductImages, handleUploadErrors, createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, uploadProductImages, handleUploadErrors, updateProduct)
  .delete(protect, deleteProduct);

export default router;
