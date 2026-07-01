import EmailLog from "../models/EmailLog.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAdminEmailLogs = asyncHandler(async (req, res) => {
  const { search = "", status = "All", page = 1, limit = 50 } = req.query;
  const query = {};

  if (status !== "All") query.status = status;
  if (search.trim()) {
    const safeSearch = new RegExp(search.replace(/[.*+?^$()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ recipient: safeSearch }, { subject: safeSearch }, { template: safeSearch }];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const [logs, total, failed] = await Promise.all([
    EmailLog.find(query).sort("-createdAt").skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    EmailLog.countDocuments(query),
    EmailLog.countDocuments({ status: "Failed" }),
  ]);

  res.json({
    success: true,
    logs,
    count: logs.length,
    total,
    failed,
    page: safePage,
    pages: Math.max(Math.ceil(total / safeLimit), 1),
  });
});

export { getAdminEmailLogs };
