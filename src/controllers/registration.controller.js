import {
  createRegistration,
  getRegistrationById,
  checkDuplicateRegistration,
  getEventRegistrations,
  getEventRegistrationCount,
  getStatusByTypeAndName,
  getEventById,
  createPass,
  createQRCode,
  getPassByRegistrationId,
} from '../services/db.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { validateRequired, validateEmail } from '../utils/validators.js';
import { getOrCreateParticipant } from './participant.controller.js';
import { generatePassNumber } from '../utils/helpers.js';
import QRCode from 'qrcode';

export const registerParticipant = async (req, res, next) => {
  try {
    const {
      event_id,
      participant_name,
      participant_email,
      participant_phone,
      organization,
      designation,
      tssia_membership_id,
    } = req.body;

    // Validation
    if (!event_id) {
      return sendError(res, 'Event ID is required', 400);
    }

    if (!validateRequired(participant_name)) {
      return sendError(res, 'Participant name is required', 400);
    }

    if (!validateEmail(participant_email)) {
      return sendError(res, 'Invalid participant email format', 400);
    }

    // Check if event exists
    const event = await getEventById(event_id);
    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    // Get or create participant
    const participant = await getOrCreateParticipant(
      participant_name,
      participant_email,
      participant_phone
    );

    // Check for duplicate registration
    const duplicateRegistration = await checkDuplicateRegistration(
      participant.participant_id,
      event_id
    );
    if (duplicateRegistration) {
      return sendError(
        res,
        'Participant is already registered for this event',
        409
      );
    }

    // Get registration status (default: pending or first status)
    const registrationStatus = await getStatusByTypeAndName('registration', 'pending');
    if (!registrationStatus) {
      return sendError(res, 'Registration status not found', 500);
    }

    const registrationData = {
      participantId: participant.participant_id,
      eventId: event_id,
      organization: organization || null,
      designation: designation || null,
      tssiaMembershipId: tssia_membership_id || null,
      registrationStatusId: registrationStatus.status_id,
    };

    const registration = await createRegistration(registrationData);

    // Generate and create pass
    const passNumber = generatePassNumber();
    const pass = await createPass(registration.registration_id, passNumber);

    // Generate QR code
    const qrCodeData = JSON.stringify({
      pass_id: pass.pass_id,
      event_id,
      participant_email,
    });
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    const qrCode = await createQRCode(pass.pass_id, qrCodeImage);

    return sendSuccess(
      res,
      {
        registration: {
          registration_id: registration.registration_id,
          participant_id: registration.participant_id,
          event_id: registration.event_id,
          organization: registration.organization,
          designation: registration.designation,
          tssia_membership_id: registration.tssia_membership_id,
          registration_status_id: registration.registration_status_id,
        },
        pass: {
          pass_id: pass.pass_id,
          pass_number: pass.pass_number,
        },
        qr_code: {
          qr_id: qrCode.qr_id,
          qr_code: qrCode.qr_code,
        },
      },
      'Participant registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getRegistration = async (req, res, next) => {
  try {
    const { registrationId } = req.params;

    if (!registrationId) {
      return sendError(res, 'Registration ID is required', 400);
    }

    const registration = await getRegistrationById(registrationId);

    if (!registration) {
      return sendError(res, 'Registration not found', 404);
    }

    return sendSuccess(res, registration);
  } catch (error) {
    next(error);
  }
};

export const listEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    const event = await getEventById(eventId);
    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    const registrations = await getEventRegistrations(eventId, pageSize, offset);
    const total = await getEventRegistrationCount(eventId);

    return sendPaginated(res, registrations, total, page, pageSize);
  } catch (error) {
    next(error);
  }
};
