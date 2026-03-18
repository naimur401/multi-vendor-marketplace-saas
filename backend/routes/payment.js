import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  getPaymentStatus,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Stripe webhook (no auth required, no rate limit on webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Create checkout session
router.post(
  '/checkout-session',
  authenticate,
  paymentLimiter,
  createCheckoutSession
);

// Get payment status
router.get('/status/:sessionId', authenticate, getPaymentStatus);

export default router;
