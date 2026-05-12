import express from 'express';
import { uploadImage, getImage, deleteImage } from '../controllers/image.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Upload image
router.post('/upload', authenticate, uploadImage);

// Get image
router.get('/:imageId', getImage);

// Delete image
router.delete('/:imageId', authenticate, adminOnly, deleteImage);

export default router;
