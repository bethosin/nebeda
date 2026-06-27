import express from "express";

import { deleteTestRecords } from "../controllers/maintenanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.delete("/test-records", protect, deleteTestRecords);

export default router;
