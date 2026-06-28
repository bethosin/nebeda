import express from "express";

import { createCheckoutSession } from "../controllers/paymentController.js";
import { protectUser } from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/create-checkout-session", protectUser, createCheckoutSession);

export default router;
