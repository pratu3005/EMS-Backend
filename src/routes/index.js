import express from 'express';
import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import participantRoutes from './participant.routes.js';
import registrationRoutes from './registration.routes.js';
import passRoutes from './pass.routes.js';
import customFieldRoutes from './customfield.routes.js';
import scanRoutes from './scan.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import ticketRoutes from './ticket.routes.js';

const router = express.Router();

// Debug route
router.get('/', (req, res) => {
  res.json({
    message: '✅ API Router is working',
    availableRoutes: {
      health: '/health',
      auth: '/auth',
      events: '/events',
      participants: '/participants',
      registrations: '/registrations',
      customFields: '/custom-fields',
      scans: '/scans',
      dashboard: '/dashboard',
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/participants', participantRoutes);
router.use('/registrations', registrationRoutes);
router.use('/passes', passRoutes);
router.use('/custom-fields', customFieldRoutes);
router.use('/scans', scanRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tickets', ticketRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: '✅ Backend is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
