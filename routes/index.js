import express from 'express';
import userRoutes from './user.js';
import adminRoutes from './admin.js'
import eurotaxRoutes from './eurotax.js';
import vehiclesRoutes from './vehicles.js';
import { generalApiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiter to all incoming API requests
router.use(generalApiRateLimiter);

router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/eurotax', eurotaxRoutes);
router.use('/carapi', vehiclesRoutes);

export default router;