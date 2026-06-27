import mongoose from "mongoose";

import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  newsletterNotificationEmail,
  newsletterWelcomeEmail,
} from "../utils/emailTemplates.js";
import { EMAIL_DELIVERY_WARNING, sendEmailSafely } from "../utils/sendEmail.js";

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const fullName = req.body.fullName?.trim();
  const source = req.body.source?.trim();

  if (!email) {
    res.status(400);
    throw new Error("Email is required.");
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  const existingSubscriber = await NewsletterSubscriber.findOne({ email });

  if (existingSubscriber?.isSubscribed) {
    res.json({
      success: true,
      message: "You are already subscribed to Nebeda Threads updates.",
      subscriber: existingSubscriber,
      data: existingSubscriber,
    });
    return;
  }

  const subscriber =
    existingSubscriber ||
    new NewsletterSubscriber({
      email,
    });

  subscriber.fullName = fullName || subscriber.fullName;
  subscriber.source = source || subscriber.source;
  subscriber.isSubscribed = true;
  subscriber.subscribedAt = new Date();
  subscriber.unsubscribedAt = undefined;
  await subscriber.save();

  const emailResults = await Promise.all([
    sendEmailSafely(newsletterWelcomeEmail(subscriber)),
    sendEmailSafely(newsletterNotificationEmail(subscriber)),
  ]);
  const emailWarning = emailResults.includes(false) ? EMAIL_DELIVERY_WARNING : undefined;

  res.status(existingSubscriber ? 200 : 201).json({
    success: true,
    message: "You are now subscribed to Nebeda Threads updates.",
    subscriber,
    data: subscriber,
    emailWarning,
  });
});

const getSubscribers = asyncHandler(async (req, res) => {
  const { search = "", status = "All" } = req.query;
  const query = {};

  if (status === "Active") query.isSubscribed = true;
  if (status === "Unsubscribed") query.isSubscribed = false;

  if (search) {
    const safeSearch = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ email: safeSearch }, { fullName: safeSearch }, { source: safeSearch }];
  }

  const subscribers = await NewsletterSubscriber.find(query)
    .sort("-subscribedAt")
    .limit(200)
    .lean();

  res.json({
    success: true,
    count: subscribers.length,
    subscribers,
    data: subscribers,
  });
});

const getSubscriberById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid subscriber id.");
  }

  const subscriber = await NewsletterSubscriber.findById(req.params.id).lean();

  if (!subscriber) {
    res.status(404);
    throw new Error("Newsletter subscriber not found.");
  }

  res.json({
    success: true,
    subscriber,
  });
});

const unsubscribeSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await NewsletterSubscriber.findById(req.params.id);

  if (!subscriber) {
    res.status(404);
    throw new Error("Newsletter subscriber not found.");
  }

  subscriber.isSubscribed = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.json({
    success: true,
    message: "Subscriber unsubscribed successfully.",
    subscriber,
  });
});

const resubscribeSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await NewsletterSubscriber.findById(req.params.id);

  if (!subscriber) {
    res.status(404);
    throw new Error("Newsletter subscriber not found.");
  }

  subscriber.isSubscribed = true;
  subscriber.subscribedAt = new Date();
  subscriber.unsubscribedAt = undefined;
  await subscriber.save();

  res.json({
    success: true,
    message: "Subscriber resubscribed successfully.",
    subscriber,
  });
});

const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await NewsletterSubscriber.findById(req.params.id);

  if (!subscriber) {
    res.status(404);
    throw new Error("Newsletter subscriber not found.");
  }

  await subscriber.deleteOne();

  res.json({
    success: true,
    message: "Subscriber deleted successfully.",
  });
});

export {
  deleteSubscriber,
  getSubscriberById,
  getSubscribers,
  resubscribeSubscriber,
  subscribeNewsletter,
  unsubscribeSubscriber,
};
