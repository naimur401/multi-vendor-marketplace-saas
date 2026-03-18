import express from 'express';
import {
  searchProducts,
  getCategories,
  getPriceRange,
  getSearchSuggestions,
} from '../controllers/searchController.js';
import { searchLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Search products with filters and pagination
router.get('/', searchLimiter, searchProducts);

// Get available categories
router.get('/categories', getCategories);

// Get price range for filters
router.get('/price-range', getPriceRange);

// Get search suggestions
router.get('/suggestions', searchLimiter, getSearchSuggestions);

export default router;
