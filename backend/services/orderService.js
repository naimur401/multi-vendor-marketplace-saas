import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { logger } from '../utils/logger.js';

const generateOrderId = () => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const createOrderFromCart = async (userId, tenantId, orderData) => {
  try {
    // Get cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals and prepare items
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = cartItem.productId;

      if (!product || !product.isActive) {
        throw new Error(`Product ${cartItem.productId} is no longer available`);
      }

      if (product.inventory < cartItem.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}`);
      }

      const itemPrice = product.discountPrice || product.price;
      const itemTotal = itemPrice * cartItem.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: cartItem.quantity,
        price: itemPrice,
        total: itemTotal,
      });

      totalAmount += itemTotal;
    }

    // Create order
    const order = new Order({
      orderId: generateOrderId(),
      userId,
      tenantId,
      items: orderItems,
      totalAmount,
      status: 'pending',
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'stripe',
      notes: orderData.notes,
    });

    await order.save();

    // Reserve inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { inventory: -item.quantity, totalSold: item.quantity } }
      );
    }

    // Clear cart
    await Cart.updateOne({ userId }, { items: [], totalItems: 0, totalPrice: 0 });

    logger.info(`Order created: ${order._id} for user ${userId}`);
    return order;
  } catch (error) {
    logger.error('Create order error:', error);
    throw error;
  }
};

export const getOrderById = async (orderId, userId = null, tenantId = null) => {
  try {
    const query = { _id: orderId };

    if (userId) {
      query.userId = userId;
    }

    if (tenantId) {
      query.tenantId = tenantId;
    }

    const order = await Order.findOne(query)
      .populate('userId', 'email firstName lastName')
      .populate('tenantId', 'name logo');

    return order;
  } catch (error) {
    logger.error('Get order error:', error);
    throw error;
  }
};

export const getUserOrders = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20, status = null, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const filter = { userId };

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('tenantId', 'name logo');

    const total = await Order.countDocuments(filter);

    return {
      orders,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error('Get user orders error:', error);
    throw error;
  }
};

export const getVendorOrders = async (tenantId, options = {}) => {
  try {
    const { page = 1, limit = 20, status = null, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const filter = { tenantId };

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email firstName lastName');

    const total = await Order.countDocuments(filter);

    return {
      orders,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error('Get vendor orders error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus, tenantId = null) => {
  try {
    const validStatuses = ['pending', 'paid', 'processing', 'completed', 'cancelled'];

    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid order status');
    }

    const query = { _id: orderId };

    if (tenantId) {
      query.tenantId = tenantId;
    }

    const order = await Order.findOneAndUpdate(
      query,
      { status: newStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      throw new Error('Order not found or unauthorized');
    }

    logger.info(`Order status updated: ${orderId} -> ${newStatus}`);

    // Handle cancellation
    if (newStatus === 'cancelled') {
      await restoreOrderInventory(order);
    }

    return order;
  } catch (error) {
    logger.error('Update order status error:', error);
    throw error;
  }
};

export const updateShippingStatus = async (orderId, shippingStatus, trackingNumber = null) => {
  try {
    const validStatuses = ['not_shipped', 'shipped', 'in_transit', 'delivered'];

    if (!validStatuses.includes(shippingStatus)) {
      throw new Error('Invalid shipping status');
    }

    const updateData = { shippingStatus };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    });

    logger.info(`Shipping status updated: ${orderId} -> ${shippingStatus}`);
    return order;
  } catch (error) {
    logger.error('Update shipping status error:', error);
    throw error;
  }
};

const restoreOrderInventory = async (order) => {
  try {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { inventory: item.quantity, totalSold: -item.quantity } }
      );
    }

    logger.info(`Inventory restored for cancelled order: ${order._id}`);
  } catch (error) {
    logger.error('Restore inventory error:', error);
  }
};
