import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import * as orderService from '../services/orderService.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Validation schemas
const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      name: z.string().min(1, 'Name required'),
      street: z.string().min(1, 'Street required'),
      city: z.string().min(1, 'City required'),
      state: z.string().min(1, 'State required'),
      postalCode: z.string().min(1, 'Postal code required'),
      country: z.string().min(1, 'Country required'),
      phone: z.string().min(1, 'Phone required'),
    }),
    paymentMethod: z.string().optional().default('stripe'),
    notes: z.string().optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'paid', 'processing', 'completed', 'cancelled']),
  }),
});

const updateShippingStatusSchema = z.object({
  body: z.object({
    shippingStatus: z.enum(['not_shipped', 'shipped', 'in_transit', 'delivered']),
    trackingNumber: z.string().optional(),
  }),
});

// Customer routes
router.post(
  '/',
  authenticate,
  authorize(['customer']),
  validateBody(createOrderSchema.shape.body),
  async (req, res) => {
    try {
      const order = await orderService.createOrderFromCart(
        req.user.id,
        null, // customers don't have tenantId
        req.validated
      );

      res.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      logger.error('Create order error:', error);
      res.status(error.message.includes('empty') || error.message.includes('not found') ? 400 : 500).json({
        error: { message: error.message, statusCode: 500 },
      });
    }
  }
);

router.get('/', authenticate, authorize(['customer']), async (req, res) => {
  try {
    const { page, limit, status, sort } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || '-createdAt',
    };

    if (status) options.status = status;

    const result = await orderService.getUserOrders(req.user.id, options);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Get user orders error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch orders', statusCode: 500 },
    });
  }
});

router.get('/:orderId', authenticate, async (req, res) => {
  try {
    let order;

    if (req.user.role === 'customer') {
      order = await orderService.getOrderById(req.params.orderId, req.user.id);
    } else if (req.user.role === 'vendor') {
      order = await orderService.getOrderById(req.params.orderId, null, req.user.tenantId);
    } else if (req.user.role === 'admin') {
      order = await orderService.getOrderById(req.params.orderId);
    }

    if (!order) {
      return res.status(404).json({
        error: { message: 'Order not found', statusCode: 404 },
      });
    }

    res.status(200).json(order);
  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch order', statusCode: 500 },
    });
  }
});

// Vendor routes
router.get(
  '/vendor/orders',
  authenticate,
  authorize(['vendor']),
  async (req, res) => {
    try {
      const { page, limit, status, sort } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        sort: sort || '-createdAt',
      };

      if (status) options.status = status;

      const result = await orderService.getVendorOrders(req.user.tenantId, options);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get vendor orders error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch orders', statusCode: 500 },
      });
    }
  }
);

router.put(
  '/:orderId/status',
  authenticate,
  authorize(['vendor', 'admin']),
  validateBody(updateOrderStatusSchema.shape.body),
  async (req, res) => {
    try {
      const tenantId = req.user.role === 'vendor' ? req.user.tenantId : null;

      const order = await orderService.updateOrderStatus(
        req.params.orderId,
        req.validated.status,
        tenantId
      );

      res.status(200).json({
        message: 'Order status updated',
        order,
      });
    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(error.message.includes('not found') || error.message.includes('unauthorized') ? 404 : 500).json({
        error: { message: error.message, statusCode: 500 },
      });
    }
  }
);

router.put(
  '/:orderId/shipping',
  authenticate,
  authorize(['vendor', 'admin']),
  validateBody(updateShippingStatusSchema.shape.body),
  async (req, res) => {
    try {
      const { shippingStatus, trackingNumber } = req.validated;

      const order = await orderService.updateShippingStatus(
        req.params.orderId,
        shippingStatus,
        trackingNumber
      );

      res.status(200).json({
        message: 'Shipping status updated',
        order,
      });
    } catch (error) {
      logger.error('Update shipping status error:', error);
      res.status(error.message.includes('Invalid') ? 400 : 500).json({
        error: { message: error.message, statusCode: 500 },
      });
    }
  }
);

export default router;
