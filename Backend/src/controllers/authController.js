import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const buildAdminResponse = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  isActive: admin.isActive,
  lastLogin: admin.lastLogin,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});

const validateRequiredFields = (fields) => {
  const missingField = Object.entries(fields).find(([, value]) => !value);

  if (missingField) {
    return `${missingField[0]} is required`;
  }

  return null;
};

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const validationError = validateRequiredFields({ name, email, password });

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const adminCount = await Admin.countDocuments();

  if (adminCount > 0) {
    res.status(403);
    throw new Error("Admin account already exists. Please login.");
  }

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    res.status(409);
    throw new Error("Admin account already exists. Please login.");
  }

  const admin = await Admin.create({ name, email, password });

  res.status(201).json({
    success: true,
    token: generateToken(admin._id),
    admin: buildAdminResponse(admin),
  });
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const validationError = validateRequiredFields({ email, password });

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!admin.isActive) {
    res.status(403);
    throw new Error("Admin account is inactive");
  }

  admin.lastLogin = new Date();
  await admin.save();

  res.json({
    success: true,
    token: generateToken(admin._id),
    admin: buildAdminResponse(admin),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    admin: buildAdminResponse(req.admin),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    res.status(400);
    throw new Error("Name or email is required");
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  if (email && email !== req.admin.email) {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(409);
      throw new Error("Email address is already in use");
    }
  }

  const admin = await Admin.findById(req.admin._id);
  if (name) admin.name = name;
  if (email) admin.email = email;
  await admin.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    admin: buildAdminResponse(admin),
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const validationError = validateRequiredFields({ currentPassword, newPassword });

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  const admin = await Admin.findById(req.admin._id).select("+password");

  if (!admin || !(await admin.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  admin.password = newPassword;
  await admin.save();

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

export { changePassword, getMe, loginAdmin, registerAdmin, updateProfile };
