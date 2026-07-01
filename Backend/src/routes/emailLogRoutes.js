import express from "express";

import { getAdminEmailLogs } from "../controllers/emailLogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", protect, getAdminEmailLogs);

export default router;
