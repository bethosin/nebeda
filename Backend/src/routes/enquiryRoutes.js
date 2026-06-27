import express from "express";

import {
  createEnquiry,
  deleteEnquiry,
  getEnquiries,
  getEnquiryById,
  restoreEnquiry,
  updateEnquiry,
} from "../controllers/enquiryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { publicWriteLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/", publicWriteLimiter, createEnquiry);
router.get("/admin", protect, getEnquiries);
router.patch("/admin/:id/restore", protect, restoreEnquiry);
router
  .route("/admin/:id")
  .get(protect, getEnquiryById)
  .put(protect, updateEnquiry)
  .delete(protect, deleteEnquiry);

export default router;
