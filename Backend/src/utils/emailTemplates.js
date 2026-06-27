const brandEmail = () => process.env.BRAND_NOTIFICATION_EMAIL;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatCurrency = (value = 0) => `£${Number(value || 0).toFixed(2)}`;

const getFirstName = (fullName = "there") => fullName.trim().split(/\s+/)[0] || "there";

const wrapEmail = (title, body) => ({
  text: body.replace(/<[^>]*>/g, "").replace(/\n{3,}/g, "\n\n").trim(),
  html: `
    <div style="font-family: Georgia, 'Times New Roman', serif; background:#050505; color:#f8f3ea; padding:32px;">
      <div style="max-width:640px; margin:auto; border:1px solid rgba(190,151,83,.45); border-radius:18px; padding:28px;">
        <p style="letter-spacing:.28em; color:#be9753; text-transform:uppercase; font-size:12px;">Nebeda Threads</p>
        <h1 style="font-size:28px; line-height:1.2; margin:12px 0 20px;">${escapeHtml(title)}</h1>
        <div style="font-family: Arial, sans-serif; color:#dfd7ca; line-height:1.7; font-size:15px;">${body}</div>
        <div style="font-family: Arial, sans-serif; border-top:1px solid rgba(190,151,83,.25); margin-top:28px; padding-top:20px; color:#aaa197; line-height:1.7; font-size:13px;">
          <p style="margin:0; color:#f8f3ea;"><strong>Nebeda Threads</strong> &middot; Elevate Your Essence</p>
          <p style="margin:6px 0 0;">Email: nebeda33@gmail.com &middot; WhatsApp: +447448668759</p>
        </div>
      </div>
    </div>
  `,
});

const welcomeEmail = (user) => ({
  to: user.email,
  subject: "Welcome to Nebeda Threads",
  ...wrapEmail(
    "Welcome to Nebeda Threads",
    `<p>Thank you ${escapeHtml(getFirstName(user.fullName))} for joining Nebeda Threads.</p>
     <p>You can shop luxury African fashion, save your cart, submit custom order requests, and receive updates about your Nebeda pieces.</p>`
  ),
});

const newSignupNotificationEmail = (user) => ({
  to: brandEmail(),
  subject: "New Nebeda Threads Customer Signup",
  ...wrapEmail(
    "New Nebeda Threads Customer Signup",
    `<p><strong>Full name:</strong> ${escapeHtml(user.fullName)}</p>
     <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
     <p><strong>WhatsApp:</strong> ${escapeHtml(user.whatsappNumber || "Not provided")}</p>
     <p><strong>Signup date:</strong> ${new Date().toLocaleString("en-GB")}</p>`
  ),
});

const customOrderConfirmationEmail = (order) => ({
  to: order.email,
  subject: "Custom Order Request Received",
  ...wrapEmail(
    "Custom Order Request Received",
    `<p>Thank you ${escapeHtml(getFirstName(order.fullName))}. Nebeda Threads has received your custom order request.</p>
     <p>We will review your design, measurements, delivery details, and contact you to confirm next steps.</p>
     <p><strong>Order reference:</strong> ${escapeHtml(order._id)}</p>`
  ),
});

const customOrderNotificationEmail = (order) => ({
  to: brandEmail(),
  subject: "New Nebeda Threads Custom Order",
  ...wrapEmail(
    "New Custom Order Request",
    `<p><strong>Customer:</strong> ${escapeHtml(order.fullName)}</p>
     <p><strong>Email:</strong> ${escapeHtml(order.email)}</p>
     <p><strong>WhatsApp:</strong> ${escapeHtml(order.whatsappNumber)}</p>
     <p><strong>Outfit:</strong> ${escapeHtml(order.outfitType)} / ${escapeHtml(order.orderType)}</p>
     <p><strong>Shipping:</strong> ${escapeHtml(order.shipping?.shippingCountry || "Not set")}</p>`
  ),
});

const enquiryConfirmationEmail = (enquiry) => ({
  to: enquiry.email,
  subject: "Your Nebeda Threads Enquiry Has Been Received",
  ...wrapEmail(
    "Enquiry Received",
    `<p>Thank you ${escapeHtml(getFirstName(enquiry.fullName))}. Your enquiry has been received.</p>
     <p>Nebeda Threads will contact you soon.</p>`
  ),
});

const enquiryNotificationEmail = (enquiry) => ({
  to: brandEmail(),
  subject: "New Nebeda Threads Enquiry",
  ...wrapEmail(
    "New Customer Enquiry",
    `<p><strong>Customer:</strong> ${escapeHtml(enquiry.fullName)}</p>
     <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
     <p><strong>WhatsApp:</strong> ${escapeHtml(enquiry.whatsappNumber || "Not provided")}</p>
     <p><strong>Type:</strong> ${escapeHtml(enquiry.enquiryType)}</p>
     <p><strong>Message:</strong> ${escapeHtml(enquiry.message)}</p>`
  ),
});

const orderReceivedEmail = (order) => ({
  to: order.customer.email,
  subject: "Nebeda Threads Order Received",
  ...wrapEmail(
    "Order Received",
    `<p>Thank you ${escapeHtml(getFirstName(order.customer.fullName))}. Your Nebeda Threads order has been received.</p>
     <p><strong>Order reference:</strong> ${escapeHtml(order._id)}</p>
     <p><strong>Total:</strong> ${formatCurrency(order.totals.total)}</p>
     <p>Payment will be completed securely when Stripe checkout is connected.</p>`
  ),
});

const orderNotificationEmail = (order) => ({
  to: brandEmail(),
  subject: "New Nebeda Threads Cart Order",
  ...wrapEmail(
    "New Cart Order",
    `<p><strong>Customer:</strong> ${escapeHtml(order.customer.fullName)}</p>
     <p><strong>Email:</strong> ${escapeHtml(order.customer.email)}</p>
     <p><strong>Items:</strong> ${order.items.length}</p>
     <p><strong>Total:</strong> ${formatCurrency(order.totals.total)}</p>
     <p><strong>Status:</strong> ${escapeHtml(order.orderStatus)} / ${escapeHtml(order.paymentStatus)}</p>`
  ),
});

const paymentConfirmationEmail = (order) => ({
  to: order.customer.email,
  subject: "Nebeda Threads Payment Confirmation",
  ...wrapEmail("Payment Confirmation", "<p>Your payment has been confirmed.</p>"),
});

const orderStatusUpdateEmail = (order) => ({
  to: order.customer.email,
  subject: "Nebeda Threads Order Status Update",
  ...wrapEmail(
    "Order Status Update",
    `<p>Your order status is now <strong>${escapeHtml(order.orderStatus)}</strong>.</p>
     <p><strong>Order reference:</strong> ${escapeHtml(order._id)}</p>`
  ),
});

const orderPaymentStatusUpdateEmail = (order) => ({
  to: order.customer.email,
  subject: "Nebeda Threads Payment Status Update",
  ...wrapEmail(
    "Payment Status Update",
    `<p>Your payment status is now <strong>${escapeHtml(order.paymentStatus)}</strong>.</p>
     <p><strong>Order reference:</strong> ${escapeHtml(order._id)}</p>`
  ),
});

const customOrderStatusUpdateEmail = (order) => ({
  to: order.email,
  subject: "Nebeda Threads Custom Order Update",
  ...wrapEmail(
    "Custom Order Update",
    `<p>Your custom order status is now <strong>${escapeHtml(order.orderStatus)}</strong>.</p>
     <p><strong>Order reference:</strong> ${escapeHtml(order._id)}</p>
     ${order.adminNotes ? `<p><strong>Notes:</strong> ${escapeHtml(order.adminNotes)}</p>` : ""}`
  ),
});

const customOrderPaymentStatusUpdateEmail = (order) => ({
  to: order.email,
  subject: "Nebeda Threads Custom Order Payment Update",
  ...wrapEmail(
    "Custom Order Payment Update",
    `<p>Your custom order payment status is now <strong>${escapeHtml(order.paymentStatus)}</strong>.</p>
     <p><strong>Order reference:</strong> ${escapeHtml(order._id)}</p>`
  ),
});

const newsletterWelcomeEmail = (subscriber) => ({
  to: subscriber.email,
  subject: "Welcome to Nebeda Threads Updates",
  ...wrapEmail(
    "Welcome to Nebeda Threads Updates",
    `<p>Thank you ${escapeHtml(getFirstName(subscriber.fullName || "there"))} for joining Nebeda Threads updates.</p>
     <p>You will receive new collection alerts, bespoke style inspiration, and exclusive Nebeda Threads offers.</p>`
  ),
});

const newsletterNotificationEmail = (subscriber) => ({
  to: brandEmail(),
  subject: "New Newsletter Subscriber",
  ...wrapEmail(
    "New Newsletter Subscriber",
    `<p><strong>Email:</strong> ${escapeHtml(subscriber.email)}</p>
     <p><strong>Name:</strong> ${escapeHtml(subscriber.fullName || "Not provided")}</p>
     <p><strong>Source:</strong> ${escapeHtml(subscriber.source || "Not provided")}</p>
     <p><strong>Date:</strong> ${new Date().toLocaleString("en-GB")}</p>`
  ),
});

// Abandoned cart email automation will be added later with scheduled jobs.
// Newsletter broadcast emails will be added later using admin campaign tools.

export {
  customOrderConfirmationEmail,
  customOrderNotificationEmail,
  customOrderPaymentStatusUpdateEmail,
  customOrderStatusUpdateEmail,
  enquiryConfirmationEmail,
  enquiryNotificationEmail,
  newSignupNotificationEmail,
  newsletterNotificationEmail,
  newsletterWelcomeEmail,
  orderNotificationEmail,
  orderPaymentStatusUpdateEmail,
  orderReceivedEmail,
  orderStatusUpdateEmail,
  paymentConfirmationEmail,
  welcomeEmail,
};
