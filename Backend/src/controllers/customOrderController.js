import mongoose from "mongoose";

import CustomOrder, {
  genders,
  orderStatuses,
  orderTypes,
  paymentProviders,
  paymentStatuses,
  shippingCountries,
} from "../models/CustomOrder.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  customOrderConfirmationEmail,
  customOrderNotificationEmail,
  customOrderPaymentStatusUpdateEmail,
  customOrderQuoteReadyEmail,
  customOrderStatusUpdateEmail,
} from "../utils/emailTemplates.js";
import { EMAIL_DELIVERY_WARNING, sendEmailSafely } from "../utils/sendEmail.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const requiredFields = [
  "fullName",
  "email",
  "whatsappNumber",
  "gender",
  "outfitType",
  "orderType",
];

const measurementFields = [
  "chestBust",
  "waist",
  "hip",
  "shoulder",
  "sleeveLength",
  "topLength",
  "trouserSkirtLength",
  "height",
  "additionalNotes",
];

const shippingFields = [
  "shippingCountry",
  "shippingMethod",
  "addressLine1",
  "addressLine2",
  "city",
  "stateCounty",
  "postcode",
  "country",
];

const adminWritableFields = [
  "orderStatus",
  "paymentStatus",
  "paymentProvider",
  "estimatedPrice",
  "adminNotes",
  "assignedTo",
  "reviewedBy",
  "reviewedAt",
];

const allowedSorts = new Set([
  "createdAt",
  "-createdAt",
  "orderStatus",
  "-orderStatus",
  "paymentStatus",
  "-paymentStatus",
  "reviewedAt",
  "-reviewedAt",
]);
const CUSTOM_ORDER_UPLOAD_FOLDER = "nebeda/custom-orders";

const getSafeSort = (sort) => (allowedSorts.has(sort) ? sort : "-createdAt");

const getPagination = (page = 1, limit = 10) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);
  return {
    limitNumber,
    pageNumber,
    skip: (pageNumber - 1) * limitNumber,
  };
};

const parseObjectField = (value, fieldName) => {
  if (!value) {
    return {};
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be an object`);
  }

  try {
    const parsed = JSON.parse(value);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error();
    }

    return parsed;
  } catch (_error) {
    throw new Error(`${fieldName} must be valid JSON`);
  }
};

const pickFields = (source, fields) =>
  fields.reduce((result, field) => {
    if (Object.hasOwn(source, field)) {
      result[field] = source[field];
    }

    return result;
  }, {});

const normalizeAdminPayload = (body) => {
  const payload = pickFields(body, adminWritableFields);

  ["assignedTo", "reviewedBy", "reviewedAt"].forEach((field) => {
    if (payload[field] === "") {
      delete payload[field];
    }
  });

  if (payload.reviewedAt) {
    payload.reviewedAt = new Date(payload.reviewedAt);
  }

  return payload;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeCreatePayload = (body) => {
  const measurements = {
    ...parseObjectField(body.measurements, "measurements"),
    ...pickFields(body, measurementFields),
  };
  const shipping = {
    ...parseObjectField(body.shipping, "shipping"),
    ...pickFields(body, shippingFields),
  };

  return {
    fullName: body.fullName,
    email: body.email,
    whatsappNumber: body.whatsappNumber,
    gender: body.gender,
    outfitType: body.outfitType,
    orderType: body.orderType,
    fabricPreference: body.fabricPreference,
    occasion: body.occasion,
    styleNotes: body.styleNotes,
    measurements,
    shipping,
  };
};

const validateCreatePayload = (payload) => {
  const missingField = requiredFields.find((field) => !payload[field]);

  if (missingField) {
    return `${missingField} is required`;
  }

  if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
    return "Please provide a valid email address";
  }

  if (!genders.includes(payload.gender)) {
    return `${payload.gender} is not a valid gender`;
  }

  if (!orderTypes.includes(payload.orderType)) {
    return `${payload.orderType} is not a valid order type`;
  }

  const { shipping } = payload;

  if (!shipping.shippingCountry) {
    return "shippingCountry is required";
  }

  if (!shippingCountries.includes(shipping.shippingCountry)) {
    return `${shipping.shippingCountry} is not a valid shipping country`;
  }

  if (!shipping.addressLine1) {
    return "addressLine1 is required";
  }

  if (!shipping.city) {
    return "city is required";
  }

  if (!shipping.country) {
    return "country is required";
  }

  return null;
};

const validateAdminPayload = (payload) => {
  if (payload.orderStatus !== undefined && !orderStatuses.includes(payload.orderStatus)) {
    return `${payload.orderStatus} is not a valid order status`;
  }

  if (
    payload.paymentStatus !== undefined &&
    !paymentStatuses.includes(payload.paymentStatus)
  ) {
    return `${payload.paymentStatus} is not a valid payment status`;
  }

  if (
    payload.paymentProvider !== undefined &&
    !paymentProviders.includes(payload.paymentProvider)
  ) {
    return `${payload.paymentProvider} is not a valid payment provider`;
  }

  if (
    payload.assignedTo !== undefined &&
    payload.assignedTo &&
    !mongoose.Types.ObjectId.isValid(payload.assignedTo)
  ) {
    return "assignedTo must be a valid admin id";
  }

  if (
    payload.reviewedBy !== undefined &&
    payload.reviewedBy &&
    !mongoose.Types.ObjectId.isValid(payload.reviewedBy)
  ) {
    return "reviewedBy must be a valid admin id";
  }

  if (
    payload.reviewedAt !== undefined &&
    payload.reviewedAt &&
    Number.isNaN(Date.parse(payload.reviewedAt))
  ) {
    return "reviewedAt must be a valid date";
  }

  return null;
};

const uploadInspirationImages = async (files = [], orderName) => {
  if (!files.length) {
    return [];
  }

  return Promise.all(
    files.map((file) =>
      uploadToCloudinary({
        buffer: file.buffer,
        folder: CUSTOM_ORDER_UPLOAD_FOLDER,
        alt: `${orderName} inspiration image`,
      })
    )
  );
};

const createCustomOrder = asyncHandler(async (req, res) => {
  const payload = normalizeCreatePayload(req.body);
  const validationError = validateCreatePayload(payload);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  let inspirationImages = [];
  try {
    inspirationImages = await uploadInspirationImages(req.files, payload.fullName);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Cloudinary custom order upload failed:", {
        message: error.message,
        httpCode: error.http_code || error.statusCode,
        name: error.name,
      });
    }
    res.status(error.statusCode || 502);
    throw new Error(
      error.message || "Image upload failed. Please check Cloudinary configuration."
    );
  }

  const order = await CustomOrder.create({
    ...payload,
    user: req.user?._id,
    inspirationImages,
  });

  const emailResults = await Promise.all([
    sendEmailSafely(customOrderConfirmationEmail(order)),
    sendEmailSafely(customOrderNotificationEmail(order)),
  ]);
  const emailWarning = emailResults.includes(false) ? EMAIL_DELIVERY_WARNING : undefined;

  // Stripe Checkout will later be created from this saved custom order.
  res.status(201).json({
    success: true,
    message: "Your custom order request has been received.",
    data: order,
    order,
    emailWarning,
  });
});

const getMyCustomOrders = asyncHandler(async (req, res) => {
  const orders = await CustomOrder.find({
    user: req.user._id,
    isArchived: false,
  })
    .sort("-createdAt")
    .lean();

  res.json({
    success: true,
    count: orders.length,
    orders,
    data: orders,
  });
});

const getMyCustomOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid custom order id");
  }

  const order = await CustomOrder.findOne({
    _id: req.params.id,
    user: req.user._id,
    isArchived: false,
  }).lean();

  if (!order) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  res.json({
    success: true,
    order,
    data: order,
  });
});

const getCustomOrders = asyncHandler(async (req, res) => {
  const {
    orderStatus,
    paymentStatus,
    search,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  const { limitNumber, pageNumber, skip } = getPagination(page, limit);
  const query = { isArchived: false };

  if (orderStatus) {
    query.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (search) {
    const safeSearch = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { fullName: safeSearch },
      { email: safeSearch },
      { whatsappNumber: safeSearch },
      { outfitType: safeSearch },
      { occasion: safeSearch },
    ];
  }

  const total = await CustomOrder.countDocuments(query);
  const orders = await CustomOrder.find(query)
    .sort(getSafeSort(sort))
    .skip(skip)
    .limit(limitNumber)
    .lean();

  res.json({
    success: true,
    count: orders.length,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber) || 1,
    total,
    orders,
  });
});

const getCustomOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid custom order id");
  }

  const order = await CustomOrder.findOne({
    _id: req.params.id,
    isArchived: false,
  }).lean();

  if (!order) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  res.json({
    success: true,
    order,
  });
});

const updateCustomOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid custom order id");
  }

  const order = await CustomOrder.findOne({
    _id: req.params.id,
    isArchived: false,
  });

  if (!order) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  const payload = normalizeAdminPayload(req.body);
  const validationError = validateAdminPayload(payload);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const statusIsMovingFromNew =
    payload.orderStatus && order.orderStatus === "New" && payload.orderStatus !== "New";
  const previousStatus = order.orderStatus;
  const previousPaymentStatus = order.paymentStatus;
  const previousEstimatedPrice = order.estimatedPrice;

  Object.entries(payload).forEach(([field, value]) => {
    if (value !== undefined) {
      order[field] = value;
    }
  });

  if (statusIsMovingFromNew) {
    if (!order.reviewedBy) {
      order.reviewedBy = req.admin._id;
    }

    if (!order.reviewedAt) {
      order.reviewedAt = new Date();
    }
  }

  await order.save();

  const emailResults = await Promise.all([
    previousStatus !== order.orderStatus ? sendEmailSafely(customOrderStatusUpdateEmail(order)) : null,
    previousEstimatedPrice !== order.estimatedPrice && Number(order.estimatedPrice) > 0
      ? sendEmailSafely(customOrderQuoteReadyEmail(order))
      : null,
    previousPaymentStatus !== order.paymentStatus
      ? sendEmailSafely(customOrderPaymentStatusUpdateEmail(order))
      : null,
  ]);

  // Stripe payment session state will later be synchronized with paymentStatus here.
  res.json({
    success: true,
    message: "Custom order updated successfully",
    order,
    emailWarning: emailResults.includes(false) ? EMAIL_DELIVERY_WARNING : undefined,
  });
});

const deleteCustomOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid custom order id");
  }

  const order = await CustomOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  order.isArchived = true;
  await order.save();

  res.json({
    success: true,
    message: "Custom order archived successfully",
    order,
  });
});

const restoreCustomOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid custom order id");
  }

  const order = await CustomOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  order.isArchived = false;
  await order.save();

  res.json({
    success: true,
    message: "Custom order restored successfully",
    order,
  });
});

export {
  createCustomOrder,
  deleteCustomOrder,
  getCustomOrderById,
  getCustomOrders,
  getMyCustomOrderById,
  getMyCustomOrders,
  restoreCustomOrder,
  updateCustomOrder,
};
