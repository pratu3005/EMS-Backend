import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  softDeleteEvent,
  permanentDeleteEvent,
  getEventCount,
  getAdminDraftEvent,
  publishEvent,
  query,
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
    const userId = req.user?.user_id;
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
      is_draft = true,
      show_event_name = true,
      show_start_date_time = true,
    } = req.body;

    // Check for existing draft event
    const existingDraft = await getAdminDraftEvent(userId);
    if (existingDraft) {
      return sendError(
        res,
        'You already have a draft event. Please publish or delete it before creating a new one.',
        400,
        { existing_draft_id: existingDraft.event_id }
      );
    }

    // Validation for non-draft events
    if (!is_draft) {
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

      if (!validateEventFor(event_for || 'all')) {
        return sendError(
          res,
          'Event for must be either "all" or "tssia_members"',
          400
        );
      }
    }

    const eventData = {
      eventName: event_name || 'Untitled Event',
      description: description || '',
      startDateTime: start_date_time || null,
      endDateTime: end_date_time || null,
      address: address || '',
      eventFor: event_for || 'all',
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
      isDraft: is_draft,
      showEventName: show_event_name,
      showStartDateTime: show_start_date_time,
      createdBy: userId || null,
    };

    const newEvent = await createEvent(eventData);

    return sendSuccess(
      res,
      newEvent,
      is_draft ? 'Draft event created successfully' : 'Event published successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const editEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.user_id;
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
      is_draft,
      show_event_name,
      show_start_date_time,
    } = req.body;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    // Validation for publishing (is_draft = false)
    if (is_draft === false) {
      if (!event_name || !validateRequired(event_name)) {
        return sendError(res, 'Event name is required to publish', 400);
      }
      if (!description || !validateRequired(description)) {
        return sendError(res, 'Description is required to publish', 400);
      }
      if (!start_date_time || !validateDatetime(start_date_time)) {
        return sendError(res, 'Valid start date/time is required to publish', 400);
      }
      if (!end_date_time || !validateDatetime(end_date_time)) {
        return sendError(res, 'Valid end date/time is required to publish', 400);
      }
      if (new Date(start_date_time) >= new Date(end_date_time)) {
        return sendError(res, 'Start date must be before end date', 400);
      }
      if (!address || !validateRequired(address)) {
        return sendError(res, 'Address is required to publish', 400);
      }
      if (event_for && !validateEventFor(event_for)) {
        return sendError(
          res,
          'Event for must be either "all" or "tssia_members"',
          400
        );
      }
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
      isDraft: is_draft !== undefined ? is_draft : event.is_draft,
      showEventName: show_event_name !== undefined ? show_event_name : event.show_event_name,
      showStartDateTime: show_start_date_time !== undefined ? show_start_date_time : event.show_start_date_time,
      updatedBy: userId || null,
    };

    const updatedEvent = await updateEvent(eventId, eventData);

    let message = 'Event updated successfully';
    if (is_draft === false && event.is_draft) {
      message = 'Event published successfully';
    }

    return sendSuccess(res, updatedEvent, message);
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

    const deletedEvent = await permanentDeleteEvent(eventId);

    return sendSuccess(res, deletedEvent, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get admin's draft event
export const getDraftEvent = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return sendError(res, 'User ID is required', 400);
    }

    const draftEvent = await getAdminDraftEvent(userId);

    if (!draftEvent) {
      return sendSuccess(res, null, 'No draft event found');
    }

    return sendSuccess(res, draftEvent);
  } catch (error) {
    next(error);
  }
};

// Publish draft event
export const publishDraftEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.user_id;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    const event = await getEventById(eventId);
    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    if (event.created_by !== userId) {
      return sendError(res, 'Unauthorized: You can only publish your own draft events', 403);
    }

    if (!event.is_draft) {
      return sendError(res, 'Event is already published', 400);
    }

    // Validate required fields
    if (!event.event_name || !event.description || !event.start_date_time || 
        !event.end_date_time || !event.address) {
      return sendError(
        res,
        'Event is missing required fields. Please complete all fields before publishing.',
        400
      );
    }

    const publishedEvent = await publishEvent(eventId, userId);
    return sendSuccess(res, publishedEvent, 'Event published successfully');
  } catch (error) {
    next(error);
  }
};

// Get assigned events for verifier
export const getAssignedEvents = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return sendError(res, 'User ID is required', 400);
    }

    const result = await query(
      `SELECT e.event_id, e.event_name, e.description, e.start_date_time, 
              e.end_date_time, e.address, e.event_status, e.capacity,
              COUNT(er.registration_id) as total_registrations
       FROM user_events ue
       JOIN events e ON ue.event_id = e.event_id
       LEFT JOIN event_registrations er ON e.event_id = er.event_id AND er.is_deleted = false
       WHERE ue.user_id = $1 AND ue.is_deleted = false AND e.is_deleted = false
         AND (e.end_date_time IS NULL OR e.end_date_time >= NOW())
       GROUP BY e.event_id, e.event_name, e.description, e.start_date_time,
                e.end_date_time, e.address, e.event_status, e.capacity
       ORDER BY e.start_date_time DESC`,
      [userId]
    );

    return sendSuccess(res, result.rows, 'Assigned events retrieved successfully');
  } catch (error) {
    next(error);
  }
};
