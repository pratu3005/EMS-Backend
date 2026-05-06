import {
  getCustomFieldsByEventId,
  createCustomField,
  saveCustomFieldResponse,
  getCustomFieldResponses,
} from '../services/db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateRequired, validateFieldType } from '../utils/validators.js';

export const getEventCustomFields = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    const customFields = await getCustomFieldsByEventId(eventId);

    return sendSuccess(res, customFields);
  } catch (error) {
    next(error);
  }
};

export const createEventCustomField = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { field_name, field_type, required } = req.body;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    if (!validateRequired(field_name)) {
      return sendError(res, 'Field name is required', 400);
    }

    if (!validateFieldType(field_type)) {
      return sendError(
        res,
        'Invalid field type. Allowed types: text, textarea, number, email, phone, dropdown, radio, checkbox, date, time, file, url',
        400
      );
    }

    const customField = await createCustomField(
      eventId,
      field_name,
      field_type,
      required || false
    );

    return sendSuccess(res, customField, 'Custom field created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const saveRegistrationCustomFields = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { customFields } = req.body; // Array of { custom_id, value }

    if (!registrationId) {
      return sendError(res, 'Registration ID is required', 400);
    }

    if (!customFields || !Array.isArray(customFields)) {
      return sendError(res, 'Custom fields must be an array', 400);
    }

    const responses = [];
    for (const field of customFields) {
      const { custom_id, value } = field;

      if (!custom_id) {
        return sendError(res, 'Custom field ID is required', 400);
      }

      const response = await saveCustomFieldResponse(registrationId, custom_id, value);
      responses.push(response);
    }

    return sendSuccess(res, responses, 'Custom field responses saved successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getRegistrationCustomFields = async (req, res, next) => {
  try {
    const { registrationId } = req.params;

    if (!registrationId) {
      return sendError(res, 'Registration ID is required', 400);
    }

    const customFieldResponses = await getCustomFieldResponses(registrationId);

    return sendSuccess(res, customFieldResponses);
  } catch (error) {
    next(error);
  }
};
