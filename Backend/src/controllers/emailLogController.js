import EmailLog from "../models/EmailLog.js";
import asyncHandler from "../utils/asyncHandler.js";
import { retryEmailLog } from "../utils/sendEmail.js";

const getAdminEmailLogs = asyncHandler(async (req, res) => {
  const { search = "", status = "All", template = "All", page = 1, limit = 50 } = req.query;
  const query = {};

  if (status !== "All") query.status = status;
  if (template !== "All") query.template = template;
  if (search.trim()) {
    const safeSearch = new RegExp(search.replace(/[.*+?^$()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ recipient: safeSearch }, { subject: safeSearch }];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const [logs, total, failed, templates] = await Promise.all([
    EmailLog.find(query).sort("-createdAt").skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    EmailLog.countDocuments(query),
    EmailLog.countDocuments({ status: "Failed" }),
    EmailLog.distinct("template"),
  ]);

  res.json({
    success: true, logs, total, failed, templates: templates.sort(),
    page: safePage, pages: Math.max(Math.ceil(total / safeLimit), 1),
  });
});

const retryFailedEmail = asyncHandler(async (req, res) => {
  const log = await EmailLog.findById(req.params.id).select("+text +html");
  if (!log) {
    res.status(404);
    throw new Error("Email log not found.");
  }
  if (log.status !== "Failed") {
    res.status(400);
    throw new Error("Only failed emails can be retried.");
  }
  if (!log.html && !log.text) {
    res.status(400);
    throw new Error("This older email log does not contain retryable content.");
  }

  try {
    await retryEmailLog(log);
  } catch (error) {
    res.status(502);
    throw new Error(error.message || "Resend could not deliver this email.");
  }

  res.json({ success: true, message: "Email sent successfully." });
});

export { getAdminEmailLogs, retryFailedEmail };
