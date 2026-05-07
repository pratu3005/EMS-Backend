import { processRegistration } from '../services/registration.service.js';
import { 
  getEventRegistrations as dbGetEventRegistrations,
  getEventRegistrationCount as dbGetEventRegistrationCount,
  getAllRegistrations as dbGetAllRegistrations,
  getAllRegistrationCount as dbGetAllRegistrationCount,
  updateRegistrationStatus as dbUpdateRegistrationStatus,
  getStatusByTypeAndName
} from '../services/db.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export const registerParticipant = async (req, res, next) => {
  try {
    const registrationData = {
      ...req.body,
      created_by: req.user?.id || 1 // Fallback for testing
    };

    const result = await processRegistration(registrationData);
    
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    if (err.message === 'Participant is already registered for this event') {
      return sendError(res, err.message, 400);
    }
    next(err);
  }
};

export const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    const registrations = await dbGetEventRegistrations(eventId, pageSize, offset);
    const total = await dbGetEventRegistrationCount(eventId);

    return sendPaginated(res, registrations, total, page, pageSize);
  } catch (error) {
    next(error);
  }
};

export const getAllRegistrations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;

    const registrations = await dbGetAllRegistrations(pageSize, offset);
    const total = await dbGetAllRegistrationCount();

    return sendPaginated(res, registrations, total, page, pageSize);
  } catch (error) {
    next(error);
  }
};

export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body; // expected: "approved", "rejected", etc.

    if (!registrationId) {
      return sendError(res, 'Registration ID is required', 400);
    }

    if (!status) {
      return sendError(res, 'Status is required', 400);
    }

    const statusObj = await getStatusByTypeAndName('registration', status);
    if (!statusObj) {
      return sendError(res, 'Invalid status', 400);
    }

    const updatedRegistration = await dbUpdateRegistrationStatus(registrationId, statusObj.status_id);

    return sendSuccess(res, updatedRegistration, 'Registration status updated successfully');
  } catch (error) {
    next(error);
  }
};
