import crypto from "crypto";

import User from "../models/User.js";
import CustomOrder from "../models/CustomOrder.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  emailVerificationEmail,
  newSignupNotificationEmail,
  passwordResetEmail,
  welcomeEmail,
} from "../utils/emailTemplates.js";
import generateToken from "../utils/generateToken.js";
import { EMAIL_DELIVERY_WARNING, sendEmailSafely } from "../utils/sendEmail.js";

const VERIFICATION_TTL = 24 * 60 * 60 * 1000;
const RESET_TTL = 60 * 60 * 1000;
const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const createToken = () => crypto.randomBytes(32).toString("hex");
const clientUrl = () => process.env.CLIENT_URL?.trim().replace(/\/$/, "");

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  whatsappNumber: user.whatsappNumber,
  isActive: user.isActive,
  isEmailVerified: user.isEmailVerified,
  emailVerifiedAt: user.emailVerifiedAt,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

const issueVerificationEmail = async (user) => {
  const token = createToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TTL);
  await user.save({ validateBeforeSave: false });
  return sendEmailSafely(emailVerificationEmail(user, `${clientUrl()}/verify-email?token=${token}`));
};

const signupUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, whatsappNumber } = req.body;
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Full name, email, and password are required.");
  }
  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) {
    res.status(409);
    throw new Error("A customer account already exists with this email.");
  }

  const user = await User.create({ fullName, email: normalizedEmail, password, whatsappNumber });
  const emailResults = await Promise.all([
    issueVerificationEmail(user),
    sendEmailSafely(newSignupNotificationEmail(user)),
  ]);

  res.status(201).json({
    success: true,
    message: "Account created. Please verify your email before checkout.",
    token: generateToken(user._id),
    user: sanitizeUser(user),
    emailWarning: emailResults.includes(false) ? EMAIL_DELIVERY_WARNING : undefined,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error("This customer account is currently inactive.");
  }

  user.lastLogin = new Date();
  await user.save();
  res.json({ success: true, token: generateToken(user._id), user: sanitizeUser(user) });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body.token?.trim();
  if (!token) {
    res.status(400);
    throw new Error("Verification token is required.");
  }

  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    res.status(400);
    throw new Error("This verification link is invalid or has expired.");
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  const welcomeSent = await sendEmailSafely(welcomeEmail(user));

  res.json({
    success: true,
    message: "Your email has been verified.",
    user: sanitizeUser(user),
    emailWarning: welcomeSent ? undefined : EMAIL_DELIVERY_WARNING,
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) {
    res.json({ success: true, message: "Your email is already verified.", user: sanitizeUser(req.user) });
    return;
  }

  const sent = await issueVerificationEmail(req.user);
  res.json({
    success: true,
    message: "A new verification email has been sent.",
    emailWarning: sent ? undefined : EMAIL_DELIVERY_WARNING,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  if (!email || !validateEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  const user = await User.findOne({ email });
  if (user?.isActive) {
    const token = createToken();
    user.passwordResetToken = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + RESET_TTL);
    await user.save({ validateBeforeSave: false });
    await sendEmailSafely(passwordResetEmail(user, `${clientUrl()}/reset-password/${token}`));
  }

  res.json({
    success: true,
    message: "If an active account exists for this email, a password reset link has been sent.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400);
    throw new Error("Reset token and new password are required.");
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters.");
  }

  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) {
    res.status(400);
    throw new Error("This password reset link is invalid or has expired.");
  }

  user.password = password;
  user.passwordChangedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Your password has been reset. You can now log in." });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, whatsappNumber } = req.body;
  if (email && !validateEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  const normalizedEmail = email?.toLowerCase().trim();
  const emailChanged = normalizedEmail && normalizedEmail !== req.user.email;
  if (emailChanged && await User.exists({ email: normalizedEmail, _id: { $ne: req.user._id } })) {
    res.status(409);
    throw new Error("A customer account already exists with this email.");
  }

  req.user.fullName = fullName || req.user.fullName;
  req.user.whatsappNumber = whatsappNumber ?? req.user.whatsappNumber;
  if (emailChanged) {
    req.user.email = normalizedEmail;
    req.user.isEmailVerified = false;
    req.user.emailVerifiedAt = undefined;
  }
  await req.user.save();

  let emailWarning;
  if (emailChanged && !(await issueVerificationEmail(req.user))) emailWarning = EMAIL_DELIVERY_WARNING;
  res.json({
    success: true,
    message: emailChanged
      ? "Profile updated. Please verify your new email address."
      : "Profile updated successfully.",
    user: sanitizeUser(req.user),
    emailWarning,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required.");
  }
  if (newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters.");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect.");
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
  res.json({ success: true, message: "Password changed successfully." });
});

const getCustomerDashboard = asyncHandler(async (req, res) => {
  const [totalOrders, pendingOrders, paidOrders, totalCustomOrders, latestOrder, latestCustomOrder, newsletterSubscriber] =
    await Promise.all([
      Order.countDocuments({ user: req.user._id, isArchived: false }),
      Order.countDocuments({ user: req.user._id, isArchived: false, orderStatus: "Pending" }),
      Order.countDocuments({ user: req.user._id, isArchived: false, paymentStatus: "Paid" }),
      CustomOrder.countDocuments({ user: req.user._id, isArchived: false }),
      Order.findOne({ user: req.user._id, isArchived: false }).sort("-createdAt").lean(),
      CustomOrder.findOne({ user: req.user._id, isArchived: false }).sort("-createdAt").lean(),
      NewsletterSubscriber.findOne({ email: req.user.email }).lean(),
    ]);

  res.json({
    success: true,
    data: {
      totalOrders, pendingOrders, paidOrders, totalCustomOrders, latestOrder, latestCustomOrder,
      newsletterSubscribed: Boolean(newsletterSubscriber?.isSubscribed),
      isEmailVerified: req.user.isEmailVerified,
    },
  });
});

const getAdminUsers = asyncHandler(async (req, res) => {
  const { search = "", status = "All" } = req.query;
  const query = {};
  if (status === "Active") query.isActive = true;
  if (status === "Inactive") query.isActive = false;
  if (search) {
    const safeSearch = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ fullName: safeSearch }, { email: safeSearch }, { whatsappNumber: safeSearch }];
  }
  const users = await User.find(query).sort("-createdAt").limit(100).lean();
  res.json({ success: true, count: users.length, users, data: users });
});

const getAdminUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.json({ success: true, user });
});

const updateAdminUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  user.isActive = Boolean(req.body.isActive);
  await user.save();
  res.json({
    success: true,
    message: user.isActive ? "User reactivated successfully." : "User deactivated successfully.",
    user: sanitizeUser(user),
  });
});

export {
  changePassword,
  forgotPassword,
  getAdminUserById,
  getAdminUsers,
  getCustomerDashboard,
  getMe,
  loginUser,
  resendVerification,
  resetPassword,
  signupUser,
  updateAdminUserStatus,
  updateProfile,
  verifyEmail,
};
