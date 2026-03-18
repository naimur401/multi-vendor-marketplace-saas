import Stripe from 'stripe';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { logger } from '../utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(req, res) {
  try {
    const { items, shippingDetails, email } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Verify product prices and availability
    const lineItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          error: `Product ${item.name} is not available in requested quantity`,
        });
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      customer_email: email,
      metadata: {
        userId,
        items: JSON.stringify(items),
        shippingDetails: JSON.stringify(shippingDetails),
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    logger.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    const { userId, items, shippingDetails } = session.metadata;
    const parsedItems = JSON.parse(items);
    const parsedShipping = JSON.parse(shippingDetails);

    // Create order
    const order = new Order({
      userId,
      items: parsedItems,
      shippingDetails: parsedShipping,
      totalAmount: session.amount_total / 100,
      status: 'paid',
      paymentIntentId: session.payment_intent,
    });

    await order.save();

    // Update inventory
    for (const item of parsedItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    await Cart.deleteOne({ userId });

    logger.info(`Order created: ${order._id}`);
  } catch (error) {
    logger.error('Error handling checkout completion:', error);
    throw error;
  }
}

async function handleChargeRefunded(charge) {
  try {
    // Find and update related order
    const order = await Order.findOne({
      paymentIntentId: charge.payment_intent,
    });

    if (order) {
      order.status = 'cancelled';
      await order.save();

      // Restore inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }

      logger.info(`Order refunded: ${order._id}`);
    }
  } catch (error) {
    logger.error('Error handling charge refund:', error);
    throw error;
  }
}

export async function getPaymentStatus(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      status: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    logger.error('Error retrieving payment status:', error);
    res.status(500).json({ error: 'Failed to retrieve payment status' });
  }
}
