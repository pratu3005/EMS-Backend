import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin only routes
router.get('/', authenticate, adminOnly, getDashboardStats);

export default router;
