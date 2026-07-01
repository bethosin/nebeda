import express from "express";

import {
  createCheckoutSession,
  createCustomOrderCheckoutSession,
} from "../controllers/paymentController.js";
import { protectUser } from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/create-checkout-session", protectUser, createCheckoutSession);
router.post("/create-custom-order-checkout-session", protectUser, createCustomOrderCheckoutSession);

export default router;
