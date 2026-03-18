import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { enforceTenantAccess } from '../middleware/tenant.js';
import { validateBody } from '../middleware/validation.js';
import { upload, handleUploadErrors } from '../middleware/upload.js';
import { searchLimiter } from '../middleware/rateLimit.js';
import * as productService from '../services/productService.js';
import * as fileService from '../services/fileService.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Validation schemas
const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name required'),
    description: z.string().min(1, 'Description required'),
    price: z.number().positive('Price must be positive'),
    discountPrice: z.number().positive().optional(),
    category: z.string().min(1, 'Category required'),
    tags: z.array(z.string()).optional(),
    inventory: z.number().int().nonnegative().optional(),
    sku: z.string().optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    discountPrice: z.number().positive().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    inventory: z.number().int().nonnegative().optional(),
    sku: z.string().optional(),
  }),
});

// Marketplace endpoints (public/customer)
router.get('/marketplace', searchLimiter, async (req, res) => {
  try {
    const { page, limit, category, minPrice, maxPrice, sort } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || '-createdAt',
    };

    if (minPrice) options.minPrice = parseFloat(minPrice);
    if (maxPrice) options.maxPrice = parseFloat(maxPrice);
    if (category) options.category = category;

    const result = await productService.getMarketplaceProducts(options);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Marketplace products error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch products', statusCode: 500 },
    });
  }
});

router.get('/search', searchLimiter, async (req, res) => {
  try {
    const { q, page, limit, category, minPrice, maxPrice } = req.query;

    if (!q) {
      return res.status(400).json({
        error: { message: 'Search query required', statusCode: 400 },
      });
    }

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    if (minPrice) options.minPrice = parseFloat(minPrice);
    if (maxPrice) options.maxPrice = parseFloat(maxPrice);
    if (category) options.category = category;

    const result = await productService.searchProducts(q, options);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Search products error:', error);
    res.status(500).json({
      error: { message: 'Search failed', statusCode: 500 },
    });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: { message: 'Product not found', statusCode: 404 },
      });
    }

    res.status(200).json(product);
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch product', statusCode: 500 },
    });
  }
});

// Vendor endpoints (protected)
router.post(
  '/',
  authenticate,
  authorize(['vendor']),
  validateBody(createProductSchema.shape.body),
  async (req, res) => {
    try {
      const product = await productService.createProduct(req.user.tenantId, req.validated);

      res.status(201).json({
        message: 'Product created successfully',
        product,
      });
    } catch (error) {
      logger.error('Create product error:', error);
      res.status(500).json({
        error: { message: 'Failed to create product', statusCode: 500 },
      });
    }
  }
);

router.get(
  '/vendor/products',
  authenticate,
  authorize(['vendor']),
  async (req, res) => {
    try {
      const { page, limit, sort } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        sort: sort || '-createdAt',
      };

      const result = await productService.getProductsByTenant(req.user.tenantId, options);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get vendor products error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch products', statusCode: 500 },
      });
    }
  }
);

router.put(
  '/:productId',
  authenticate,
  authorize(['vendor']),
  validateBody(updateProductSchema.shape.body),
  async (req, res) => {
    try {
      const product = await productService.updateProduct(
        req.params.productId,
        req.user.tenantId,
        req.validated
      );

      res.status(200).json({
        message: 'Product updated successfully',
        product,
      });
    } catch (error) {
      logger.error('Update product error:', error);
      res.status(error.message.includes('not found') ? 404 : 500).json({
        error: { message: error.message, statusCode: 500 },
      });
    }
  }
);

router.delete(
  '/:productId',
  authenticate,
  authorize(['vendor']),
  async (req, res) => {
    try {
      const product = await productService.deleteProduct(req.params.productId, req.user.tenantId);

      res.status(200).json({
        message: 'Product deleted successfully',
        product,
      });
    } catch (error) {
      logger.error('Delete product error:', error);
      res.status(error.message.includes('not found') ? 404 : 500).json({
        error: { message: error.message, statusCode: 500 },
      });
    }
  }
);

// Upload product images
router.post(
  '/:productId/upload-images',
  authenticate,
  authorize(['vendor']),
  upload.array('images', 5),
  handleUploadErrors,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: { message: 'No images provided', statusCode: 400 },
        });
      }

      const product = await productService.getProductById(req.params.productId, req.user.tenantId);

      if (!product) {
        return res.status(404).json({
          error: { message: 'Product not found', statusCode: 404 },
        });
      }

      // Upload images to Cloudinary
      const uploadedImages = await Promise.all(
        req.files.map((file, index) =>
          fileService.uploadImage(
            file.buffer,
            `products/${req.user.tenantId}`,
            `${req.params.productId}-${index}`
          )
        )
      );

      // Update product with image URLs
      product.images.push(
        ...uploadedImages.map((img) => ({
          url: img.url,
          publicId: img.publicId,
        }))
      );

      await product.save();

      res.status(200).json({
        message: 'Images uploaded successfully',
        images: uploadedImages,
      });
    } catch (error) {
      logger.error('Upload images error:', error);
      res.status(500).json({
        error: { message: 'Failed to upload images', statusCode: 500 },
      });
    }
  }
);

export default router;
