const fulfilmentTransitions = Object.freeze({
  Pending: ["Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
});

const milestoneFields = Object.freeze({
  Processing: "processingAt",
  Shipped: "shippedAt",
  Delivered: "deliveredAt",
  Cancelled: "cancelledAt",
});

const validateTrackingUrl = (trackingUrl) => {
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    throw new Error("Tracking URL must start with http:// or https://.");
  }
};

const applyFulfilmentUpdate = (
  order,
  {
    orderStatus,
    trackingNumber,
    trackingCarrier,
    trackingUrl,
    dispatchNotes,
    deliveryNotes,
    note,
    changedBy,
  },
) => {
  if (!orderStatus || !Object.hasOwn(fulfilmentTransitions, orderStatus)) {
    throw new Error(`${orderStatus || "Order status"} is not a valid order status.`);
  }

  validateTrackingUrl(trackingUrl);

  const previousStatus = order.orderStatus;
  const statusChanged = previousStatus !== orderStatus;

  if (statusChanged) {
    const allowed = fulfilmentTransitions[previousStatus] || [];
    if (!allowed.includes(orderStatus)) {
      throw new Error(`${previousStatus} orders cannot be moved to ${orderStatus}.`);
    }

    if (
      ["Processing", "Shipped", "Delivered"].includes(orderStatus) &&
      order.paymentStatus !== "Paid"
    ) {
      throw new Error("Only paid orders can enter fulfilment.");
    }

    if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
    const milestoneField = milestoneFields[orderStatus];
    if (milestoneField && !order[milestoneField]) order[milestoneField] = new Date();

    order.orderStatus = orderStatus;
    order.statusHistory.push({
      status: orderStatus,
      changedAt: new Date(),
      changedBy,
      note: String(note || "").trim() || undefined,
    });
  }

  if (trackingNumber !== undefined) order.shipping.trackingNumber = String(trackingNumber || "").trim();
  if (trackingCarrier !== undefined) order.shipping.trackingCarrier = String(trackingCarrier || "").trim();
  if (trackingUrl !== undefined) order.shipping.trackingUrl = String(trackingUrl || "").trim();
  if (dispatchNotes !== undefined) order.shipping.dispatchNotes = String(dispatchNotes || "").trim();
  if (deliveryNotes !== undefined) order.shipping.deliveryNotes = String(deliveryNotes || "").trim();

  return { previousStatus, statusChanged };
};

export { applyFulfilmentUpdate, fulfilmentTransitions };
