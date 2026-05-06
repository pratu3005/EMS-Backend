import express from 'express';
import {
  getParticipant,
  createNewParticipant,
} from '../controllers/participant.controller.js';

const router = express.Router();

router.get('/:participantId', getParticipant);
router.post('/', createNewParticipant);

export default router;
