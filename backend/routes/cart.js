import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import * as cartService from '../services/cartService.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Validation schemas
const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID required'),
    tenantId: z.string().min(1, 'Tenant ID required'),
    quantity: z.number().int().positive().optional().default(1),
  }),
});

const updateQuantitySchema = z.object({
  body: z.object({
    quantity: z.number().int().positive().min(1, 'Quantity must be at least 1'),
  }),
});

// Get cart
router.get('/', authenticate, async (req, res) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user.id);

    res.status(200).json(cart);
  } catch (error) {
    logger.error('Get cart error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch cart', statusCode: 500 },
    });
  }
});

// Get cart summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const summary = await cartService.getCartSummary(req.user.id);

    res.status(200).json(summary);
  } catch (error) {
    logger.error('Get cart summary error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch cart summary', statusCode: 500 },
    });
  }
});

// Add to cart
router.post(
  '/add',
  authenticate,
  validateBody(addToCartSchema.shape.body),
  async (req, res) => {
    try {
      const { productId, tenantId, quantity } = req.validated;

      const cart = await cartService.addToCart(req.user.id, productId, tenantId, quantity);

      res.status(200).json({
        message: 'Product added to cart',
        cart,
      });
    } catch (error) {
      logger.error('Add to cart error:', error);
      res.status(error.message.includes('not found') ? 404 : 500).json({
        error: { message: error.message, statusCode: 500 },
      });
    }
  }
);

// Remove from cart
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const cart = await cartService.removeFromCart(req.user.id, req.params.productId);

    res.status(200).json({
      message: 'Product removed from cart',
      cart,
    });
  } catch (error) {
    logger.error('Remove from cart error:', error);
    res.status(500).json({
      error: { message: 'Failed to remove product from cart', statusCode: 500 },
    });
  }
});

// Update cart item quantity
router.put(
  '/:productId/quantity',
  authenticate,
  validateBody(updateQuantitySchema.shape.body),
  async (req, res) => {
    try {
      const { quantity } = req.validated;

      const cart = await cartService.updateCartItemQuantity(req.user.id, req.params.productId, quantity);

      res.status(200).json({
        message: 'Quantity updated',
        cart,
      });
    } catch (error) {
      logger.error('Update quantity error:', error);
      res.status(500).json({
        error: { message: error.message, statusCode: 500 },
      });
    }
  }
);

// Clear cart
router.post('/clear', authenticate, async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);

    res.status(200).json({
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    logger.error('Clear cart error:', error);
    res.status(500).json({
      error: { message: 'Failed to clear cart', statusCode: 500 },
    });
  }
});

export default router;
