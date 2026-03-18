import { logger } from '../utils/logger.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { body, params, query } = req;
      const dataToValidate = { body, params, query };

      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: errors,
          },
        });
      }

      req.validated = result.data;
      next();
    } catch (error) {
      logger.error('Validation middleware error:', error);
      res.status(500).json({ error: { message: 'Internal server error', statusCode: 500 } });
    }
  };
};

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: errors,
          },
        });
      }

      req.validated = result.data;
      next();
    } catch (error) {
      logger.error('Body validation error:', error);
      res.status(500).json({ error: { message: 'Internal server error', statusCode: 500 } });
    }
  };
};
