import express from 'express';
import {
  register,
  login,
  getProfile,
  listAllUsers,
  updateVerifierEvents,
  editUser,
  removeUser,
  logout,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.get('/users', authenticate, listAllUsers);
router.patch('/users/:userId/events', authenticate, updateVerifierEvents);
router.put('/users/:userId', authenticate, editUser);
router.delete('/users/:userId', authenticate, removeUser);
router.post('/logout', logout);

export default router;
