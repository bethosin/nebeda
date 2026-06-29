import express from "express";

import {
  getShippingOptions,
  getShippingQuote,
} from "../controllers/shippingController.js";

const router = express.Router();

router.get("/options", getShippingOptions);
router.post("/quote", getShippingQuote);

export default router;
