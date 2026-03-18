import Tenant from '../models/Tenant.js';
import Order from '../models/Order.js';
import { logger } from '../utils/logger.js';

export const getTenantById = async (tenantId) => {
  try {
    const tenant = await Tenant.findById(tenantId).populate('ownerId', 'email firstName lastName');
    return tenant;
  } catch (error) {
    logger.error('Get tenant error:', error);
    throw error;
  }
};

export const getTenantBySlug = async (slug) => {
  try {
    const tenant = await Tenant.findOne({ slug }).populate('ownerId', 'email firstName lastName');
    return tenant;
  } catch (error) {
    logger.error('Get tenant by slug error:', error);
    throw error;
  }
};

export const updateTenant = async (tenantId, updateData) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(tenantId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    logger.info(`Tenant updated: ${tenantId}`);
    return tenant;
  } catch (error) {
    logger.error('Update tenant error:', error);
    throw error;
  }
};

export const getTenantStats = async (tenantId) => {
  try {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const orders = await Order.find({ tenantId });
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const products = await require('../models/Product.js').default.countDocuments({
      tenantId,
      isActive: true,
    });

    return {
      tenantId,
      tenantName: tenant.name,
      totalOrders,
      completedOrders,
      totalRevenue,
      activeProducts: products,
      rating: tenant.rating,
      status: tenant.status,
    };
  } catch (error) {
    logger.error('Get tenant stats error:', error);
    throw error;
  }
};

export const getAllTenants = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status = null, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const tenants = await Tenant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'email firstName lastName');

    const total = await Tenant.countDocuments(filter);

    return {
      tenants,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error('Get all tenants error:', error);
    throw error;
  }
};

export const approveTenant = async (tenantId) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { status: 'approved' },
      { new: true }
    );

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    logger.info(`Tenant approved: ${tenantId}`);
    return tenant;
  } catch (error) {
    logger.error('Approve tenant error:', error);
    throw error;
  }
};

export const suspendTenant = async (tenantId, reason = '') => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { status: 'suspended' },
      { new: true }
    );

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    logger.info(`Tenant suspended: ${tenantId}. Reason: ${reason}`);
    return tenant;
  } catch (error) {
    logger.error('Suspend tenant error:', error);
    throw error;
  }
};

export const rejectTenant = async (tenantId, reason = '') => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { status: 'rejected' },
      { new: true }
    );

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    logger.info(`Tenant rejected: ${tenantId}. Reason: ${reason}`);
    return tenant;
  } catch (error) {
    logger.error('Reject tenant error:', error);
    throw error;
  }
};
