import express from 'express';
import {
  listEvents,
  getEvent,
  createNewEvent,
  editEvent,
  deleteEvent,
  getDraftEvent,
  publishDraftEvent,
  getAssignedEvents,
} from '../controllers/event.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', listEvents);

// Verifier routes (must be before /:eventId)
router.get('/verifier/assigned', authenticate, getAssignedEvents);

// Draft management routes (must be before /:eventId)
router.get('/user/draft', authenticate, adminOnly, getDraftEvent);

// Parameterized routes (must be last)
router.get('/:eventId', getEvent);
router.post('/', authenticate, adminOnly, createNewEvent);
router.put('/:eventId', authenticate, adminOnly, editEvent);
router.delete('/:eventId', authenticate, adminOnly, deleteEvent);
router.put('/:eventId/publish', authenticate, adminOnly, publishDraftEvent);

export default router;
