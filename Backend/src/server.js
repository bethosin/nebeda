import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

import "./config/cloudinary.js";
import connectDB from "./config/db.js";
import { validateEnvironment } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import customOrderRoutes from "./routes/customOrderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userAuthRoutes from "./routes/userAuthRoutes.js";

const app = express();
const PORT = Number(process.env.PORT);
let server;

validateEnvironment();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userAuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/custom-orders", customOrderRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down Nebeda Threads API.`);

  if (server) {
    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(0);
    });
    return;
  }

  await mongoose.connection.close(false);
  process.exit(0);
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error.message);
  if (server) {
    server.close(() => process.exit(1));
    return;
  }
  process.exit(1);
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`Nebeda Threads API running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
