import express from 'express';
import { scanQR } from '../controllers/scan.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Scan QR code (verifier route)
router.post('/', authenticate, authorize(['admin', 'verifier']), scanQR);

export default router;
