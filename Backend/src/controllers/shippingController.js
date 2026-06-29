import { calculateShipping, getShippingCatalog } from "../config/shipping.js";
import asyncHandler from "../utils/asyncHandler.js";

const getShippingOptions = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: getShippingCatalog() });
});

const getShippingQuote = asyncHandler(async (req, res) => {
  const { country, subtotal, shippingMethod, currency } = req.body;
  const result = calculateShipping({
    country,
    subtotal,
    requestedMethod: shippingMethod,
    currency,
  });

  res.json({ success: true, message: result.message, data: result });
});

export { getShippingOptions, getShippingQuote };
