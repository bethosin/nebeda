import jwt from "jsonwebtoken";

const generateToken = (adminId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing from the backend environment");
  }

  return jwt.sign({ id: adminId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export default generateToken;
