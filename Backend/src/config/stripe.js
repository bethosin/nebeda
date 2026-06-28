import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = secretKey ? new Stripe(secretKey) : null;

const getStripeClient = () => {
  if (!stripe) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to Backend/.env.");
  }

  return stripe;
};

export { getStripeClient };
export default stripe;
