import CustomOrder from "../models/CustomOrder.js";
import Enquiry from "../models/Enquiry.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const testPattern = /test/i;

const deleteTestRecords = asyncHandler(async (_req, res) => {
  if (process.env.ENABLE_MAINTENANCE_ROUTES !== "true") {
    return res.status(403).json({
      success: false,
      message: "Maintenance routes are disabled.",
    });
  }

  const [users, products, newsletterSubscribers, enquiries, orders, customOrders] =
    await Promise.all([
      User.deleteMany({ $or: [{ email: testPattern }, { fullName: testPattern }] }),
      Product.deleteMany({ name: testPattern }),
      NewsletterSubscriber.deleteMany({
        $or: [{ email: testPattern }, { fullName: testPattern }],
      }),
      Enquiry.deleteMany({
        $or: [{ email: testPattern }, { fullName: testPattern }, { message: testPattern }],
      }),
      Order.deleteMany({
        $or: [
          { "customer.email": testPattern },
          { "customer.fullName": testPattern },
          { "items.name": testPattern },
        ],
      }),
      CustomOrder.deleteMany({
        $or: [{ email: testPattern }, { fullName: testPattern }, { styleNotes: testPattern }],
      }),
    ]);

  const deleted = {
    users: users.deletedCount,
    products: products.deletedCount,
    newsletterSubscribers: newsletterSubscribers.deletedCount,
    enquiries: enquiries.deletedCount,
    orders: orders.deletedCount,
    customOrders: customOrders.deletedCount,
  };

  return res.json({
    success: true,
    message: "Obvious test records were deleted.",
    deleted,
    totalDeleted: Object.values(deleted).reduce((total, count) => total + count, 0),
  });
});

export { deleteTestRecords };
