import express from "express";

import { getAdminEmailLogs, retryFailedEmail } from "../controllers/emailLogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", protect, getAdminEmailLogs);
router.post("/admin/:id/retry", protect, retryFailedEmail);

export default router;
