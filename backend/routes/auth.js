import express from 'express';
import { register, login, me, updateProfile, createVendorStore } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema, updateProfileSchema, createVendorStoreSchema } from '../schemas/authSchemas.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => res.json({ message: 'auth route working' }));

// Public
router.post('/register', authLimiter, validateBody(registerSchema.shape.body), register);
router.post('/login', authLimiter, validateBody(loginSchema.shape.body), login);

// Protected
router.get('/me', authenticate, me);
router.put('/profile', authenticate, validateBody(updateProfileSchema.shape.body), updateProfile);
router.post('/vendor-store', authenticate, validateBody(createVendorStoreSchema.shape.body), createVendorStore);

export default router;