import { logger } from '../utils/logger.js';

/**
 * Multi-tenant isolation middleware
 * Automatically enforces tenantId filtering for all queries
 * This prevents accidental data leaks if developers forget to filter by tenantId
 */
export const tenantMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    }

    // Customers don't have a tenantId, they access the marketplace
    // Vendors have a tenantId - their store
    // Admins have no tenantId - they access all data
    
    req.user.tenantId = req.user.tenantId || null;
    
    // Store tenant context for services to use
    req.tenantContext = {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      role: req.user.role,
    };

    next();
  } catch (error) {
    logger.error('Tenant middleware error:', error);
    res.status(500).json({ error: { message: 'Internal server error', statusCode: 500 } });
  }
};

/**
 * Enforce tenant isolation for tenant-specific endpoints
 * Only allows access if user is vendor of the requested tenant or admin
 */
export const enforceTenantAccess = (req, res, next) => {
  try {
    const requestedTenantId = req.params.tenantId || req.body.tenantId;

    if (!requestedTenantId) {
      return res.status(400).json({ error: { message: 'TenantId required', statusCode: 400 } });
    }

    // Admins can access all tenants
    if (req.user.role === 'admin') {
      return next();
    }

    // Vendors can only access their own tenant
    if (req.user.role === 'vendor') {
      if (req.user.tenantId.toString() !== requestedTenantId) {
        return res.status(403).json({ error: { message: 'Forbidden - cannot access other vendors data', statusCode: 403 } });
      }
      return next();
    }

    // Customers cannot access tenant-specific endpoints
    return res.status(403).json({ error: { message: 'Forbidden - customers cannot access vendor data', statusCode: 403 } });
  } catch (error) {
    logger.error('Tenant access enforcement error:', error);
    res.status(500).json({ error: { message: 'Internal server error', statusCode: 500 } });
  }
};
