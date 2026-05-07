import { getPassDetails } from '../services/registration.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getPass = async (req, res, next) => {
  try {
    const { registration_id } = req.params;
    
    if (!registration_id) {
      return sendError(res, 'Registration ID is required', 400);
    }

    const result = await getPassDetails(registration_id);
    
    return sendSuccess(res, result);
  } catch (err) {
    if (err.message === 'Pass not found') {
      return sendError(res, err.message, 404);
    }
    next(err);
  }
};
