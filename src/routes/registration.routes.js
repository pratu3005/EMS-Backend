import express from 'express';
import {
  registerParticipant,
  getRegistration,
  listEventRegistrations,
} from '../controllers/registration.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public registration
router.post('/', registerParticipant);
router.get('/:registrationId', getRegistration);

// List registrations for an event
router.get('/event/:eventId', listEventRegistrations);

export default router;
