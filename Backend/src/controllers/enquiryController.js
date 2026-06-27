import mongoose from "mongoose";

import Enquiry, { enquiryStatuses, enquiryTypes } from "../models/Enquiry.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  enquiryConfirmationEmail,
  enquiryNotificationEmail,
} from "../utils/emailTemplates.js";
import { EMAIL_DELIVERY_WARNING, sendEmailSafely } from "../utils/sendEmail.js";

const adminWritableFields = ["status", "adminNotes", "handledBy", "handledAt"];
const allowedSorts = new Set(["createdAt", "-createdAt", "status", "-status", "handledAt", "-handledAt"]);

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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pickFields = (source, fields) =>
  fields.reduce((result, field) => {
    if (Object.hasOwn(source, field)) {
      result[field] = source[field];
    }
    return result;
  }, {});

const validateCreatePayload = (payload) => {
  const requiredFields = ["fullName", "email", "enquiryType", "message"];
  const missingField = requiredFields.find((field) => !payload[field]);

  if (missingField) {
    return `${missingField} is required`;
  }

  if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
    return "Please provide a valid email address";
  }

  if (!enquiryTypes.includes(payload.enquiryType)) {
    return `${payload.enquiryType} is not a valid enquiry type`;
  }

  return null;
};

const normalizeAdminPayload = (body) => {
  const payload = pickFields(body, adminWritableFields);

  ["handledBy", "handledAt"].forEach((field) => {
    if (payload[field] === "") {
      delete payload[field];
    }
  });

  if (payload.handledAt) {
    payload.handledAt = new Date(payload.handledAt);
  }

  return payload;
};

const validateAdminPayload = (payload) => {
  if (payload.status !== undefined && !enquiryStatuses.includes(payload.status)) {
    return `${payload.status} is not a valid enquiry status`;
  }

  if (
    payload.handledBy !== undefined &&
    payload.handledBy &&
    !mongoose.Types.ObjectId.isValid(payload.handledBy)
  ) {
    return "handledBy must be a valid admin id";
  }

  if (
    payload.handledAt !== undefined &&
    payload.handledAt &&
    Number.isNaN(Date.parse(payload.handledAt))
  ) {
    return "handledAt must be a valid date";
  }

  return null;
};

const createEnquiry = asyncHandler(async (req, res) => {
  const payload = pickFields(req.body, [
    "fullName",
    "email",
    "whatsappNumber",
    "enquiryType",
    "message",
  ]);
  const validationError = validateCreatePayload(payload);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const enquiry = await Enquiry.create(payload);

  const emailResults = await Promise.all([
    sendEmailSafely(enquiryConfirmationEmail(enquiry)),
    sendEmailSafely(enquiryNotificationEmail(enquiry)),
  ]);
  const emailWarning = emailResults.includes(false) ? EMAIL_DELIVERY_WARNING : undefined;

  res.status(201).json({
    success: true,
    message: "Your enquiry has been received.",
    enquiry,
    emailWarning,
  });
});

const getEnquiries = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10, sort = "-createdAt" } = req.query;
  const { limitNumber, pageNumber, skip } = getPagination(page, limit);
  const query = { isArchived: false };

  if (status && status !== "All") {
    query.status = status;
  }

  if (search) {
    const safeSearch = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { fullName: safeSearch },
      { email: safeSearch },
      { whatsappNumber: safeSearch },
      { enquiryType: safeSearch },
      { message: safeSearch },
    ];
  }

  const total = await Enquiry.countDocuments(query);
  const enquiries = await Enquiry.find(query)
    .sort(getSafeSort(sort))
    .skip(skip)
    .limit(limitNumber)
    .lean();

  res.json({
    success: true,
    count: enquiries.length,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber) || 1,
    total,
    enquiries,
    data: enquiries,
  });
});

const getEnquiryById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid enquiry id");
  }

  const enquiry = await Enquiry.findOne({ _id: req.params.id, isArchived: false }).lean();

  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }

  res.json({
    success: true,
    enquiry,
  });
});

const updateEnquiry = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid enquiry id");
  }

  const enquiry = await Enquiry.findOne({ _id: req.params.id, isArchived: false });

  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }

  const payload = normalizeAdminPayload(req.body);
  const validationError = validateAdminPayload(payload);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  Object.entries(payload).forEach(([field, value]) => {
    if (value !== undefined) {
      enquiry[field] = value;
    }
  });

  if (payload.status && payload.status !== "New" && !enquiry.handledBy) {
    enquiry.handledBy = req.admin._id;
  }

  if (payload.status && payload.status !== "New" && !enquiry.handledAt) {
    enquiry.handledAt = new Date();
  }

  await enquiry.save();

  res.json({
    success: true,
    message: "Enquiry updated successfully",
    enquiry,
  });
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid enquiry id");
  }

  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }

  enquiry.isArchived = true;
  enquiry.status = "Archived";
  await enquiry.save();

  res.json({
    success: true,
    message: "Enquiry archived successfully",
    enquiry,
  });
});

const restoreEnquiry = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid enquiry id");
  }

  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }

  enquiry.isArchived = false;
  if (enquiry.status === "Archived") {
    enquiry.status = "New";
  }
  await enquiry.save();

  res.json({
    success: true,
    message: "Enquiry restored successfully",
    enquiry,
  });
});

export {
  createEnquiry,
  deleteEnquiry,
  getEnquiries,
  getEnquiryById,
  restoreEnquiry,
  updateEnquiry,
};
