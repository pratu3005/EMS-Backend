import {
  getParticipantByEmail,
  createParticipant,
  getParticipantById,
} from '../services/db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateEmail, validatePhone, validateRequired } from '../utils/validators.js';

// Get or create participant
export const getOrCreateParticipant = async (name, email, phone) => {
  // Try to get existing participant by email
  let participant = await getParticipantByEmail(email);

  if (!participant) {
    // Create new participant if doesn't exist
    participant = await createParticipant(name, email, phone);
  }

  return participant;
};

export const getParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;

    if (!participantId) {
      return sendError(res, 'Participant ID is required', 400);
    }

    const participant = await getParticipantById(participantId);

    if (!participant) {
      return sendError(res, 'Participant not found', 404);
    }

    return sendSuccess(res, participant);
  } catch (error) {
    next(error);
  }
};

export const createNewParticipant = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    // Validation
    if (!validateRequired(name)) {
      return sendError(res, 'Name is required', 400);
    }

    if (!validateEmail(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    if (phone && !validatePhone(phone)) {
      return sendError(res, 'Invalid phone format', 400);
    }

    // Check if participant exists
    const existingParticipant = await getParticipantByEmail(email);
    if (existingParticipant) {
      return sendSuccess(res, existingParticipant, 'Participant already exists', 200);
    }

    const participant = await createParticipant(name, email, phone);

    return sendSuccess(res, participant, 'Participant created successfully', 201);
  } catch (error) {
    next(error);
  }
};
