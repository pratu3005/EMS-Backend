import {
  getQRCodeByCode,
  getPassById,
  getRegistrationById,
  createScanLog,
  getScanLogsByEventId,
  getScanLogCount,
  query,
} from '../services/db.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export const scanQRCode = async (req, res, next) => {
  try {
    const { qr_code, event_id } = req.body;
    const scannedByUserId = req.user?.user_id;

    if (!qr_code) {
      return sendError(res, 'QR code is required', 400);
    }

    if (!event_id) {
      return sendError(res, 'Event ID is required', 400);
    }

    // Find QR code
    const qrCodeRecord = await getQRCodeByCode(qr_code);
    if (!qrCodeRecord) {
      return sendError(res, 'Invalid QR code', 404);
    }

    // Get pass
    const pass = await getPassById(qrCodeRecord.pass_id);
    if (!pass) {
      return sendError(res, 'Pass not found', 404);
    }

    // Get registration
    const registration = await getRegistrationById(pass.registration_id);
    if (!registration) {
      return sendError(res, 'Registration not found', 404);
    }

    // Check if registration belongs to the event
    if (registration.event_id !== parseInt(event_id)) {
      return sendError(res, 'QR code does not belong to this event', 400);
    }

    // Create scan log
    const scanLog = await createScanLog(event_id, registration.registration_id, scannedByUserId);

    // Update attendance status to 'present'
    const presentStatus = await query(
      'SELECT * FROM status_master WHERE type = $1 AND name = $2',
      ['attendance', 'present']
    );

    if (presentStatus.rows[0]) {
      await query(
        'UPDATE event_registrations SET attendance_status_id = $1 WHERE registration_id = $2',
        [presentStatus.rows[0].status_id, registration.registration_id]
      );
    }

    return sendSuccess(
      res,
      {
        scan_log: scanLog,
        registration: {
          registration_id: registration.registration_id,
          event_id: registration.event_id,
          participant_id: registration.participant_id,
        },
      },
      'QR code scanned successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getScanLogs = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;

    if (!eventId) {
      return sendError(res, 'Event ID is required', 400);
    }

    const scanLogs = await getScanLogsByEventId(eventId, pageSize, offset);
    const total = await getScanLogCount(eventId);

    return sendPaginated(res, scanLogs, total, page, pageSize);
  } catch (error) {
    next(error);
  }
};
