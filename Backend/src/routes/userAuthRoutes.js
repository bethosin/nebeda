import express from "express";

import {
  changePassword,
  getCustomerDashboard,
  getAdminUserById,
  getAdminUsers,
  getMe,
  loginUser,
  signupUser,
  updateAdminUserStatus,
  updateProfile,
} from "../controllers/userAuthController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { protectUser } from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/signup", authLimiter, signupUser);
router.post("/login", authLimiter, loginUser);
router.get("/me", protectUser, getMe);
router.get("/dashboard", protectUser, getCustomerDashboard);
router.put("/profile", protectUser, updateProfile);
router.put("/change-password", protectUser, changePassword);

router.get("/admin", protect, getAdminUsers);
router.get("/admin/:id", protect, getAdminUserById);
router.put("/admin/:id/status", protect, updateAdminUserStatus);

export default router;
