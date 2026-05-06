import express from 'express';
import { scanQRCode, getScanLogs } from '../controllers/scan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Scan QR code (requires authentication)
router.post('/qr', authenticate, scanQRCode);

// Get scan logs for an event
router.get('/event/:eventId', getScanLogs);

export default router;
