import Stripe from 'stripe';
import { config } from './env.js';

export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export const stripeConfig = {
  secretKey: config.STRIPE_SECRET_KEY,
  webhookSecret: config.STRIPE_WEBHOOK_SECRET,
  publishableKey: config.STRIPE_PUBLISHABLE_KEY,
};

export default stripe;
