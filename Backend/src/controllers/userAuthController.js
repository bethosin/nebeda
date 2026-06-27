import User from "../models/User.js";
import CustomOrder from "../models/CustomOrder.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  newSignupNotificationEmail,
  welcomeEmail,
} from "../utils/emailTemplates.js";
import generateToken from "../utils/generateToken.js";
import { EMAIL_DELIVERY_WARNING, sendEmailSafely } from "../utils/sendEmail.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  whatsappNumber: user.whatsappNumber,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

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

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

  if (existingUser) {
    res.status(409);
    throw new Error("A customer account already exists with this email.");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    whatsappNumber,
  });

  const emailResults = await Promise.all([
    sendEmailSafely(welcomeEmail(user)),
    sendEmailSafely(newSignupNotificationEmail(user)),
  ]);
  const emailWarning = emailResults.includes(false) ? EMAIL_DELIVERY_WARNING : undefined;

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: sanitizeUser(user),
    emailWarning,
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

  res.json({
    success: true,
    token: generateToken(user._id),
    user: sanitizeUser(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, whatsappNumber } = req.body;

  if (email && !validateEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  if (email && email.toLowerCase().trim() !== req.user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409);
      throw new Error("A customer account already exists with this email.");
    }
  }

  req.user.fullName = fullName || req.user.fullName;
  req.user.email = email || req.user.email;
  req.user.whatsappNumber = whatsappNumber ?? req.user.whatsappNumber;

  await req.user.save();

  res.json({
    success: true,
    message: "Profile updated successfully.",
    user: sanitizeUser(req.user),
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
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully.",
  });
});

const getCustomerDashboard = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    pendingOrders,
    paidOrders,
    totalCustomOrders,
    latestOrder,
    latestCustomOrder,
    newsletterSubscriber,
  ] = await Promise.all([
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
      totalOrders,
      pendingOrders,
      paidOrders,
      totalCustomOrders,
      latestOrder,
      latestCustomOrder,
      newsletterSubscribed: Boolean(newsletterSubscriber?.isSubscribed),
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

  res.json({
    success: true,
    count: users.length,
    users,
    data: users,
  });
});

const getAdminUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.json({
    success: true,
    user,
  });
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
  getAdminUserById,
  getAdminUsers,
  getCustomerDashboard,
  getMe,
  loginUser,
  signupUser,
  updateAdminUserStatus,
  updateProfile,
};
