import { Server } from 'socket.io';
import { verifyToken } from './jwt.js';
import { logger } from './logger.js';

let io = null;
const userConnections = new Map(); // Map of userId -> socketId

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.tenantId = decoded.tenantId;
      socket.role = decoded.role;
      next();
    } catch (error) {
      logger.error('Socket auth error:', error);
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);
    userConnections.set(socket.userId, socket.id);

    // Join user-specific room for direct notifications
    socket.join(`user:${socket.userId}`);

    // Join vendor room if user is a vendor
    if (socket.role === 'vendor' && socket.tenantId) {
      socket.join(`vendor:${socket.tenantId}`);
    }

    // Join admin room if user is admin
    if (socket.role === 'admin') {
      socket.join('admin');
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
      userConnections.delete(socket.userId);
    });

    // Handle custom events
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function notifyUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function notifyVendor(vendorId, event, data) {
  if (!io) return;
  io.to(`vendor:${vendorId}`).emit(event, data);
}

export function notifyAdmins(event, data) {
  if (!io) return;
  io.to('admin').emit(event, data);
}

export function broadcastOrderCreated(order) {
  if (!io) return;

  const { userId, items } = order;
  const vendorIds = new Set(items.map((item) => item.vendorId));

  // Notify user
  notifyUser(userId, 'order_created', {
    orderId: order._id,
    message: 'Your order has been placed successfully',
    totalAmount: order.totalAmount,
  });

  // Notify each vendor
  vendorIds.forEach((vendorId) => {
    notifyVendor(vendorId, 'new_order', {
      orderId: order._id,
      userId,
      items: order.items.filter((item) => item.vendorId === vendorId),
      totalAmount: order.totalAmount,
      message: `New order received for ${order.items.length} item(s)`,
    });
  });

  // Notify admins
  notifyAdmins('order_created', {
    orderId: order._id,
    userId,
    totalAmount: order.totalAmount,
    message: 'New order placed on the platform',
  });
}

export function broadcastPaymentSuccess(order) {
  if (!io) return;

  const { userId } = order;

  notifyUser(userId, 'payment_success', {
    orderId: order._id,
    message: 'Payment successful! Your order is being processed.',
    totalAmount: order.totalAmount,
  });

  notifyAdmins('payment_success', {
    orderId: order._id,
    userId,
    totalAmount: order.totalAmount,
    message: 'Payment received',
  });
}

export function broadcastOrderStatusUpdate(orderId, newStatus, vendorIds) {
  if (!io) return;

  // Notify vendors
  vendorIds.forEach((vendorId) => {
    notifyVendor(vendorId, 'order_status_updated', {
      orderId,
      status: newStatus,
      message: `Order status updated to ${newStatus}`,
    });
  });

  // Notify admins
  notifyAdmins('order_status_updated', {
    orderId,
    status: newStatus,
    message: `Order status changed to ${newStatus}`,
  });
}
