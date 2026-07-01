import jwt from "jsonwebtoken";

import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const readBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

const protectUser = asyncHandler(async (req, res, next) => {
  const token = readBearerToken(req);
  const isOrderCreation = req.method === "POST" && req.originalUrl.endsWith("/api/orders");
  const authMessage = isOrderCreation
    ? "Please login or create an account to complete your order."
    : "Not authorized. User token is missing.";

  if (!token) {
    res.status(401);
    throw new Error(authMessage);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const passwordChangedAfterToken = user?.passwordChangedAt &&
      Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat;

    if (!user || !user.isActive || passwordChangedAfterToken) {
      res.status(401);
      throw new Error("Not authorized. User account is unavailable.");
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401);
    throw new Error(
      isOrderCreation
        ? "Please login or create an account to complete your order."
        : "Not authorized. User token is invalid or expired.",
    );
  }
});

const optionalUser = asyncHandler(async (req, _res, next) => {
  const token = readBearerToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const passwordChangedAfterToken = user?.passwordChangedAt &&
      Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat;

    if (user?.isActive && !passwordChangedAfterToken) {
      req.user = user;
    }
  } catch (_error) {
    // Optional user context remains unavailable if a token is stale.
  }

  next();
});

export { optionalUser, protectUser };
