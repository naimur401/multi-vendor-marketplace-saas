import Product from '../models/Product.js';
import { logger } from '../utils/logger.js';

export const createProduct = async (tenantId, productData) => {
  try {
    const product = new Product({
      ...productData,
      tenantId,
    });
    await product.save();
    logger.info(`Product created: ${product._id} for tenant ${tenantId}`);
    return product;
  } catch (error) {
    logger.error('Create product error:', error);
    throw error;
  }
};

export const getProductById = async (productId, tenantId = null) => {
  try {
    const query = { _id: productId, isActive: true };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const product = await Product.findOne(query);
    return product;
  } catch (error) {
    logger.error('Get product error:', error);
    throw error;
  }
};

export const getProductsByTenant = async (tenantId, options = {}) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const products = await Product.find({ tenantId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ tenantId, isActive: true });

    return {
      products,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error('Get products by tenant error:', error);
    throw error;
  }
};

export const searchProducts = async (query, options = {}) => {
  try {
    const { page = 1, limit = 20, category = null, minPrice = 0, maxPrice = Infinity } = options;
    const skip = (page - 1) * limit;

    const searchFilter = {
      $text: { $search: query },
      isActive: true,
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (category) {
      searchFilter.category = category;
    }

    const products = await Product.find(searchFilter)
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(searchFilter);

    return {
      products,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error('Search products error:', error);
    throw error;
  }
};

export const getMarketplaceProducts = async (options = {}) => {
  try {
    const { page = 1, limit = 20, category = null, minPrice = 0, maxPrice = Infinity, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
      inventory: { $gt: 0 },
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return {
      products,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error('Get marketplace products error:', error);
    throw error;
  }
};

export const updateProduct = async (productId, tenantId, updateData) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: productId, tenantId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    logger.info(`Product updated: ${productId}`);
    return product;
  } catch (error) {
    logger.error('Update product error:', error);
    throw error;
  }
};

export const deleteProduct = async (productId, tenantId) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: productId, tenantId },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    logger.info(`Product deleted (soft): ${productId}`);
    return product;
  } catch (error) {
    logger.error('Delete product error:', error);
    throw error;
  }
};

export const updateProductInventory = async (productId, quantity) => {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { inventory: -quantity } },
      { new: true }
    );

    if (!product || product.inventory < 0) {
      throw new Error('Insufficient inventory');
    }

    return product;
  } catch (error) {
    logger.error('Update inventory error:', error);
    throw error;
  }
};

export const addProductReview = async (productId, review) => {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $push: { reviews: { ...review, createdAt: new Date() } } },
      { new: true }
    );

    return product;
  } catch (error) {
    logger.error('Add review error:', error);
    throw error;
  }
};
