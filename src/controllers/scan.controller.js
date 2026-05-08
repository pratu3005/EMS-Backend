import { processScan } from '../services/registration.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const scanQR = async (req, res, next) => {
  try {
    const { qr_code } = req.body;
    const scannedBy = req.user?.user_id; // Correct property from authenticated user

    if (!qr_code) {
      return sendError(res, 'QR code is required', 400);
    }

    if (!scannedBy) {
      return sendError(res, 'User authentication required', 401);
    }

    const result = await processScan(qr_code, scannedBy);
    
    return sendSuccess(res, result, 'Attendance marked successfully');
  } catch (err) {
    if (err.message === 'Invalid QR code' || err.message?.startsWith('Invalid:')) {
      return sendError(res, err.message, 400);
    }
    next(err);
  }
};
