import express from "express";

import {
  createCustomOrder,
  deleteCustomOrder,
  getCustomOrderById,
  getCustomOrders,
  getMyCustomOrderById,
  getMyCustomOrders,
  restoreCustomOrder,
  updateCustomOrder,
} from "../controllers/customOrderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { publicWriteLimiter } from "../middleware/rateLimitMiddleware.js";
import { protectUser } from "../middleware/userAuthMiddleware.js";
import {
  handleUploadErrors,
  uploadCustomOrderImages,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  publicWriteLimiter,
  protectUser,
  uploadCustomOrderImages,
  handleUploadErrors,
  createCustomOrder
);

router.get("/my-orders", protectUser, getMyCustomOrders);
router.get("/my-orders/:id", protectUser, getMyCustomOrderById);

router.get("/admin", protect, getCustomOrders);
router.patch("/admin/:id/restore", protect, restoreCustomOrder);
router
  .route("/admin/:id")
  .get(protect, getCustomOrderById)
  .put(protect, updateCustomOrder)
  .delete(protect, deleteCustomOrder);

export default router;
