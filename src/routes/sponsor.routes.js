import express from 'express';
import * as sponsorController from '../controllers/sponsor.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (if any)

// Protected routes - require authentication
router.use(authenticate);

/**
 * Get sponsors for an event
 * GET /sponsors/event/:eventId
 */
router.get('/event/:eventId', sponsorController.getEventSponsors);

/**
 * Get sponsors for a template
 * GET /sponsors/template/:templateId
 */
router.get('/template/:templateId', sponsorController.getTemplateSponsors);

/**
 * Add a sponsor
 * POST /sponsors
 * Body: { eventId?, templateId, sponsorName, logoImageId, positionOrder? }
 */
router.post('/', authorize(['admin']), sponsorController.addSponsor);

/**
 * Update a sponsor
 * PUT /sponsors/:sponsorId
 * Body: { sponsorName?, logoImageId?, positionOrder?, isActive? }
 */
router.put('/:sponsorId', authorize(['admin']), sponsorController.updateSponsor);

/**
 * Delete a sponsor (soft delete)
 * DELETE /sponsors/:sponsorId
 */
router.delete('/:sponsorId', authorize(['admin']), sponsorController.deleteSponsor);

/**
 * Reorder sponsors
 * PUT /sponsors/reorder
 * Body: { sponsors: [ { sponsor_id, position_order }, ... ] }
 */
router.put('/reorder/all', authorize(['admin']), sponsorController.reorderSponsors);

export default router;
