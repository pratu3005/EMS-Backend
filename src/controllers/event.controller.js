import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  softDeleteEvent,
  getEventCount,
} from '../services/db.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import {
  validateRequired,
  validateDatetime,
  validateEventFor,
} from '../utils/validators.js';

export const listEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;

    const events = await getAllEvents(pageSize, offset);
    const total = await getEventCount();

    return sendPaginated(res, events, total, page, pageSize);
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    const event = await getEventById(eventId);

    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    return sendSuccess(res, event);
  } catch (error) {
    next(error);
  }
};

export const createNewEvent = async (req, res, next) => {
  try {
    const {
      event_name,
      description,
      start_date_time,
      end_date_time,
      address,
      event_for,
      image_id,
      capacity,
      entry_fee,
      category,
      additional_info,
      organizer_details,
      registration_fields,
      success_page_config,
    } = req.body;

    // Validation
    if (!validateRequired(event_name)) {
      return sendError(res, 'Event name is required', 400);
    }

    if (!validateRequired(description)) {
      return sendError(res, 'Description is required', 400);
    }

    if (!validateDatetime(start_date_time)) {
      return sendError(res, 'Invalid start date/time format', 400);
    }

    if (!validateDatetime(end_date_time)) {
      return sendError(res, 'Invalid end date/time format', 400);
    }

    if (new Date(start_date_time) >= new Date(end_date_time)) {
      return sendError(res, 'Start date must be before end date', 400);
    }

    if (!validateRequired(address)) {
      return sendError(res, 'Address is required', 400);
    }

    if (!validateEventFor(event_for)) {
      return sendError(
        res,
        'Event for must be either "all" or "tssia_members"',
        400
      );
    }

    const eventData = {
      eventName: event_name,
      description,
      startDateTime: start_date_time,
      endDateTime: end_date_time,
      address,
      eventFor: event_for,
      imageId: image_id || null,
      capacity: capacity || null,
      entryFee: entry_fee || 0,
      category: category || 'EVENT',
      additionalInfo: additional_info || '',
      organizerName: organizer_details?.name || '',
      organizerEmail: organizer_details?.email || '',
      organizerPhone: organizer_details?.phone || null,
      organizerRole: organizer_details?.role || 'Event Organizer',
      registrationFields: registration_fields || [],
      successPageConfig: success_page_config || {},
    };

    const newEvent = await createEvent(eventData);

    return sendSuccess(res, newEvent, 'Event created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const editEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const {
      event_name,
      description,
      start_date_time,
      end_date_time,
      address,
      event_for,
      image_id,
      capacity,
      entry_fee,
      category,
      additional_info,
      organizer_details,
      registration_fields,
      success_page_config,
    } = req.body;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    // Validation
    if (event_name && !validateRequired(event_name)) {
      return sendError(res, 'Event name cannot be empty', 400);
    }

    if (start_date_time && !validateDatetime(start_date_time)) {
      return sendError(res, 'Invalid start date/time format', 400);
    }

    if (end_date_time && !validateDatetime(end_date_time)) {
      return sendError(res, 'Invalid end date/time format', 400);
    }

    if (event_for && !validateEventFor(event_for)) {
      return sendError(
        res,
        'Event for must be either "all" or "tssia_members"',
        400
      );
    }

    const eventData = {
      eventName: event_name || event.event_name,
      description: description || event.description,
      startDateTime: start_date_time || event.start_date_time,
      endDateTime: end_date_time || event.end_date_time,
      address: address || event.address,
      eventFor: event_for || event.event_for,
      imageId: image_id !== undefined ? image_id : event.image_id,
      capacity: capacity !== undefined ? capacity : event.capacity,
      entryFee: entry_fee !== undefined ? entry_fee : event.entry_fee,
      category: category || event.category,
      additionalInfo: additional_info || event.additional_info,
      organizerName: organizer_details?.name || event.organizer_name,
      organizerEmail: organizer_details?.email || event.organizer_email,
      organizerPhone: organizer_details?.phone || event.organizer_phone,
      organizerRole: organizer_details?.role || event.organizer_role,
      registrationFields: registration_fields || event.registration_fields,
      successPageConfig: success_page_config || event.success_page_config,
    };

    const updatedEvent = await updateEvent(eventId, eventData);

    return sendSuccess(res, updatedEvent, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    const event = await getEventById(eventId);
    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    const deletedEvent = await softDeleteEvent(eventId);

    return sendSuccess(res, deletedEvent, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
};
