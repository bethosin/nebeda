import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized. Token is missing.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      res.status(401);
      throw new Error("Not authorized. Admin account is unavailable.");
    }

    req.admin = admin;
    next();
  } catch (_error) {
    res.status(401);
    throw new Error("Not authorized. Token is invalid or expired.");
  }
});

export { protect };
