import express from 'express';
import { getPass } from '../controllers/pass.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Retrieve pass details
router.get('/:registration_id', getPass);

export default router;
