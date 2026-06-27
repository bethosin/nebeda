import express from "express";

import {
  archiveOrder,
  createOrder,
  getAdminOrderById,
  getAdminOrders,
  getMyOrderById,
  getMyOrders,
  updateAdminOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectUser } from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/", protectUser, createOrder);
router.get("/my-orders", protectUser, getMyOrders);
router.get("/my-orders/:id", protectUser, getMyOrderById);

router.get("/admin", protect, getAdminOrders);
router.get("/admin/:id", protect, getAdminOrderById);
router.put("/admin/:id", protect, updateAdminOrder);
router.patch("/admin/:id/status", protect, updateOrderStatus);
router.put("/admin/:id/status", protect, updateOrderStatus);
router.patch("/admin/:id/payment-status", protect, updatePaymentStatus);
router.put("/admin/:id/payment-status", protect, updatePaymentStatus);
router.delete("/admin/:id", protect, archiveOrder);

export default router;
