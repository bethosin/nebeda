import express from "express";

import {
  deleteSubscriber,
  getSubscriberById,
  getSubscribers,
  resubscribeSubscriber,
  subscribeNewsletter,
  unsubscribeSubscriber,
} from "../controllers/newsletterController.js";
import { protect } from "../middleware/authMiddleware.js";
import { publicWriteLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/subscribe", publicWriteLimiter, subscribeNewsletter);

router.get("/admin", protect, getSubscribers);
router.get("/admin/:id", protect, getSubscriberById);
router.patch("/admin/:id/unsubscribe", protect, unsubscribeSubscriber);
router.patch("/admin/:id/resubscribe", protect, resubscribeSubscriber);
router.delete("/admin/:id", protect, deleteSubscriber);

export default router;
