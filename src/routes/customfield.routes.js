import express from 'express';
import {
  getEventCustomFields,
  createEventCustomField,
  saveRegistrationCustomFields,
  getRegistrationCustomFields,
} from '../controllers/customfield.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Custom fields for event
router.get('/event/:eventId', getEventCustomFields);
router.post('/event/:eventId', authenticate, adminOnly, createEventCustomField);

// Custom field responses for registration
router.get('/registration/:registrationId', getRegistrationCustomFields);
router.post('/registration/:registrationId', saveRegistrationCustomFields);

export default router;
