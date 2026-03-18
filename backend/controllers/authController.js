import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'customer' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: { message: 'User already exists', statusCode: 400 } });

    const user = new User({ email, password, firstName, lastName, role });
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role, tenantId: user.tenantId });

    logger.info(`User registered: ${email}`);

    res.status(201).json({ message: 'Registered', token, user: user.toJSON() });
  } catch (err) {
    logger.error('Registration error:', err);
    res.status(500).json({ error: { message: 'Registration failed', statusCode: 500 } });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) return res.status(401).json({ error: { message: 'Invalid email or password', statusCode: 401 } });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ error: { message: 'Invalid email or password', statusCode: 401 } });

    if (!user.isActive) return res.status(403).json({ error: { message: 'User inactive', statusCode: 403 } });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role, tenantId: user.tenantId });

    logger.info(`User logged in: ${email}`);

    res.status(200).json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ error: { message: 'Login failed', statusCode: 500 } });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: { message: 'User not found', statusCode: 404 } });

    res.status(200).json({ user: user.toJSON() });
  } catch (err) {
    logger.error('Profile error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch profile', statusCode: 500 } });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    logger.info(`Profile updated: ${req.user.id}`);
    res.status(200).json({ message: 'Profile updated', user: user.toJSON() });
  } catch (err) {
    logger.error('Update profile error:', err);
    res.status(500).json({ error: { message: 'Failed to update profile', statusCode: 500 } });
  }
};

export const createVendorStore = async (req, res) => {
  try {
    const { storeName, storeSlug, description, category, email, phone, address } = req.body;
    const userId = req.user.id;

    const existingTenant = await Tenant.findOne({ ownerId: userId });
    if (existingTenant) return res.status(400).json({ error: { message: 'User already has store', statusCode: 400 } });

    const existingSlug = await Tenant.findOne({ slug: storeSlug });
    if (existingSlug) return res.status(400).json({ error: { message: 'Slug exists', statusCode: 400 } });

    const tenant = new Tenant({ name: storeName, slug: storeSlug, description, ownerId: userId, email, phone, address, category: category || 'other', status: 'pending' });
    await tenant.save();

    const user = await User.findByIdAndUpdate(userId, { role: 'vendor', tenantId: tenant._id }, { new: true });

    const token = generateToken({ id: user._id, email: user.email, role: user.role, tenantId: user.tenantId });

    logger.info(`Vendor store created: ${storeName} by user ${userId}`);

    res.status(201).json({ message: 'Vendor store created', token, tenant, user: user.toJSON() });
  } catch (err) {
    logger.error('Create vendor store error:', err);
    res.status(500).json({ error: { message: 'Failed to create vendor store', statusCode: 500 } });
  }
};