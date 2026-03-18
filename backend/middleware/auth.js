import { verifyToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided', statusCode: 401 } });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: { message: 'Invalid or expired token', statusCode: 401 } });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: { message: 'Authentication failed', statusCode: 401 } });
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Forbidden - insufficient permissions', statusCode: 403 } });
    }

    next();
  };
};
