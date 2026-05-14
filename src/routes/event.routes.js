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
router.get('/:eventId', getEvent);

// Verifier routes
router.get('/verifier/assigned', authenticate, getAssignedEvents);

// Admin routes
router.post('/', authenticate, adminOnly, createNewEvent);
router.put('/:eventId', authenticate, adminOnly, editEvent);
router.delete('/:eventId', authenticate, adminOnly, deleteEvent);

// Draft management routes
router.get('/user/draft', authenticate, adminOnly, getDraftEvent);
router.put('/:eventId/publish', authenticate, adminOnly, publishDraftEvent);

export default router;
