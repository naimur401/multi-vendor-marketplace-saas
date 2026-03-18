import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all vendors
router.get('/vendors', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const vendors = await Tenant.find().populate('ownerId', 'email firstName lastName');
    const vendorsWithEmail = vendors.map(v => ({
      ...v.toJSON(),
      ownerEmail: v.ownerId?.email || '',
    }));
    res.json({ vendors: vendorsWithEmail });
  } catch (error) {
    logger.error('Get vendors error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch vendors', statusCode: 500 } });
  }
});

// Approve vendor
router.patch('/vendors/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const vendor = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ error: { message: 'Vendor not found', statusCode: 404 } });
    res.json({ message: 'Vendor approved', vendor });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to approve vendor', statusCode: 500 } });
  }
});

// Suspend vendor
router.patch('/vendors/:id/suspend', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const vendor = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ error: { message: 'Vendor not found', statusCode: 404 } });
    res.json({ message: 'Vendor suspended', vendor });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to suspend vendor', statusCode: 500 } });
  }
});

export default router;