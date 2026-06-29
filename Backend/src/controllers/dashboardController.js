import CustomOrder from "../models/CustomOrder.js";
import Enquiry from "../models/Enquiry.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    totalProducts,
    activeProducts,
    inactiveProducts,
    totalUsers,
    activeUsers,
    totalOrders,
    customOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    pendingPayments,
    paidOrders,
    paidCartOrders,
    totalRevenueResult,
    readyToWearProducts,
    bespokeRequests,
    weddingRequests,
    enquiries,
    newEnquiries,
    newsletterSubscribers,
    activeNewsletterSubscribers,
    unsubscribedNewsletterSubscribers,
    recentUsers,
    recentOrders,
    recentProducts,
    recentCustomOrders,
    recentEnquiries,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: false }),
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Order.countDocuments({ isArchived: false }),
    CustomOrder.countDocuments({ isArchived: false }),
    Order.countDocuments({ isArchived: false, orderStatus: "Pending" }),
    Order.countDocuments({ isArchived: false, orderStatus: "Processing" }),
    Order.countDocuments({ isArchived: false, orderStatus: "Shipped" }),
    Order.countDocuments({ isArchived: false, orderStatus: "Delivered" }),
    Order.countDocuments({ isArchived: false, paymentStatus: "Pending" }),
    CustomOrder.countDocuments({ isArchived: false, paymentStatus: "Paid" }),
    Order.countDocuments({ isArchived: false, paymentStatus: "Paid" }),
    Order.aggregate([
      { $match: { isArchived: false, paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totals.total" } } },
    ]),
    Product.countDocuments({ categories: "Ready to Wear" }),
    CustomOrder.countDocuments({ isArchived: false, orderType: "Bespoke" }),
    CustomOrder.countDocuments({ isArchived: false, orderType: "Wedding" }),
    Enquiry.countDocuments({ isArchived: false }),
    Enquiry.countDocuments({ isArchived: false, status: "New" }),
    NewsletterSubscriber.countDocuments(),
    NewsletterSubscriber.countDocuments({ isSubscribed: true }),
    NewsletterSubscriber.countDocuments({ isSubscribed: false }),
    User.find().sort("-createdAt").limit(5).lean(),
    Order.find({ isArchived: false }).sort("-createdAt").limit(5).lean(),
    Product.find().sort("-createdAt").limit(5).lean(),
    CustomOrder.find({ isArchived: false }).sort("-createdAt").limit(5).lean(),
    Enquiry.find({ isArchived: false }).sort("-createdAt").limit(5).lean(),
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;

  res.json({
    success: true,
    stats: {
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalUsers,
      activeUsers,
      totalOrders,
      customOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      pendingPayments,
      readyToWearProducts,
      bespokeRequests,
      weddingRequests,
      enquiries,
      newEnquiries,
      newsletterSubscribers,
      activeNewsletterSubscribers,
      unsubscribedNewsletterSubscribers,
      paidOrders: paidCartOrders,
      paidCustomOrders: paidOrders,
      totalRevenue,
    },
    recent: {
      users: recentUsers,
      orders: recentOrders,
      products: recentProducts,
      customOrders: recentCustomOrders,
      enquiries: recentEnquiries,
    },
  });
});

export { getDashboardStats };
