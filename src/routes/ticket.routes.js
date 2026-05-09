import express from 'express';
import { saveTemplate, getTemplate } from '../controllers/ticket.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/templates/:eventId', authenticate, getTemplate);
router.post('/templates', authenticate, adminOnly, saveTemplate);

export default router;
