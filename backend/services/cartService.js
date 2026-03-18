import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { logger } from '../utils/logger.js';

export const getOrCreateCart = async (userId) => {
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    return cart;
  } catch (error) {
    logger.error('Get or create cart error:', error);
    throw error;
  }
};

export const addToCart = async (userId, productId, tenantId, quantity = 1) => {
  try {
    // Verify product exists and get its details
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      inventory: { $gte: quantity },
    });

    if (!product) {
      throw new Error('Product not found or insufficient inventory');
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        tenantId,
        quantity,
        price: product.discountPrice || product.price,
      });
    }

    await cart.save();
    logger.info(`Product added to cart: userId=${userId}, productId=${productId}`);
    return cart;
  } catch (error) {
    logger.error('Add to cart error:', error);
    throw error;
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (!cart) {
      throw new Error('Cart not found');
    }

    logger.info(`Product removed from cart: userId=${userId}, productId=${productId}`);
    return cart;
  } catch (error) {
    logger.error('Remove from cart error:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  try {
    if (quantity <= 0) {
      return removeFromCart(userId, productId);
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find((i) => i.productId.toString() === productId);

    if (!item) {
      throw new Error('Item not in cart');
    }

    // Verify product has enough inventory
    const product = await Product.findById(productId);
    if (!product || product.inventory < quantity) {
      throw new Error('Insufficient inventory');
    }

    item.quantity = quantity;
    await cart.save();

    logger.info(`Cart item quantity updated: userId=${userId}, productId=${productId}, quantity=${quantity}`);
    return cart;
  } catch (error) {
    logger.error('Update cart item quantity error:', error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalItems: 0, totalPrice: 0 },
      { new: true }
    );

    logger.info(`Cart cleared: userId=${userId}`);
    return cart;
  } catch (error) {
    logger.error('Clear cart error:', error);
    throw error;
  }
};

export const getCartSummary = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    }

    // Calculate totals and verify inventory
    let totalPrice = 0;
    let totalItems = 0;

    for (const item of cart.items) {
      const product = item.productId;

      if (!product || !product.isActive) {
        // Remove inactive products
        await Cart.updateOne(
          { _id: cart._id },
          { $pull: { items: { _id: item._id } } }
        );
        continue;
      }

      if (product.inventory < item.quantity) {
        // Adjust quantity to available inventory
        item.quantity = product.inventory;
      }

      const itemPrice = product.discountPrice || product.price;
      totalPrice += itemPrice * item.quantity;
      totalItems += item.quantity;
    }

    return {
      items: cart.items,
      totalItems,
      totalPrice,
    };
  } catch (error) {
    logger.error('Get cart summary error:', error);
    throw error;
  }
};
