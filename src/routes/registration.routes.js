import express from 'express';
import { 
  registerParticipant,
  getEventRegistrations,
  getAllRegistrations,
  updateRegistrationStatus
} from '../controllers/registration.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public registration
router.post('/', registerParticipant);

// Admin/Verifier routes
router.get('/', getAllRegistrations);
router.get('/event/:eventId', getEventRegistrations);
router.patch('/:registrationId/status', updateRegistrationStatus);

export default router;
