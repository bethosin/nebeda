import express from "express";

import {
  changePassword,
  forgotPassword,
  getCustomerDashboard,
  getAdminUserById,
  getAdminUsers,
  getMe,
  loginUser,
  resendVerification,
  resetPassword,
  signupUser,
  updateAdminUserStatus,
  updateProfile,
  verifyEmail,
} from "../controllers/userAuthController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { protectUser } from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/signup", authLimiter, signupUser);
router.post("/login", authLimiter, loginUser);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/resend-verification", authLimiter, protectUser, resendVerification);
router.get("/me", protectUser, getMe);
router.get("/dashboard", protectUser, getCustomerDashboard);
router.put("/profile", protectUser, updateProfile);
router.put("/change-password", protectUser, changePassword);

router.get("/admin", protect, getAdminUsers);
router.get("/admin/:id", protect, getAdminUserById);
router.put("/admin/:id/status", protect, updateAdminUserStatus);

export default router;
