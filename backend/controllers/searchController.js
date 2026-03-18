import Product from '../models/Product.js';
import { logger } from '../utils/logger.js';

export async function searchProducts(req, res) {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = { status: 'active' };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort query
    let sort = {};
    if (q) {
      // Full-text search if query provided
      filter.$text = { $search: q };
      sort = { score: { $meta: 'textScore' } };
    } else {
      switch (sortBy) {
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'price_low':
          sort = { price: 1 };
          break;
        case 'price_high':
          sort = { price: -1 };
          break;
        case 'popular':
          sort = { rating: -1, sales: -1 };
          break;
        case 'relevance':
        default:
          sort = { sales: -1, createdAt: -1 };
      }
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories: categories.sort() });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function getPriceRange(req, res) {
  try {
    const priceStats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    const { minPrice = 0, maxPrice = 1000 } = priceStats[0] || {};

    res.json({ minPrice, maxPrice });
  } catch (error) {
    logger.error('Get price range error:', error);
    res.status(500).json({ error: 'Failed to fetch price range' });
  }
}

export async function getSearchSuggestions(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Product.find(
      { $text: { $search: q }, status: 'active' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .select('name -_id');

    res.json({
      suggestions: suggestions.map((p) => p.name),
    });
  } catch (error) {
    logger.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
}
