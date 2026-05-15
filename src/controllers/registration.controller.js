import { processRegistration } from '../services/registration.service.js';
import pool from '../config/db.js';
import { generatePassNumber, generateRandomQRText } from '../utils/pass.js';
import { encodeQRData } from '../utils/qr.js';
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
      created_by: req.user?.user_id || null // Use authenticated user ID, allow null for public registrations
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
  const client = await pool.connect();
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

    await client.query('BEGIN');

    // Update registration status
    const updatedRegistration = await client.query(
      `UPDATE event_registrations 
       SET registration_status_id = $1, updated_at = NOW()
       WHERE registration_id = $2
       RETURNING *`,
      [statusObj.status_id, registrationId]
    );

    // If status is "approved", auto-generate pass, QR code, and ticket
    if (status === 'approved' && updatedRegistration.rows.length > 0) {
      const reg = updatedRegistration.rows[0];
      
      // Check if pass already exists
      const existingPass = await client.query(
        'SELECT pass_id FROM passes WHERE registration_id = $1',
        [registrationId]
      );

      let passId;
      let qrCodeId;

      if (existingPass.rows.length === 0) {
        // Get event name for prefix
        const eventRes = await client.query('SELECT event_name FROM events WHERE event_id = $1', [reg.event_id]);
        const eventName = eventRes.rows[0]?.event_name || 'EVT';
        
        // Get count for serial
        const countRes = await client.query('SELECT COUNT(*) FROM passes p JOIN event_registrations er ON p.registration_id = er.registration_id WHERE er.event_id = $1', [reg.event_id]);
        const serial = parseInt(countRes.rows[0].count) + 1;

        // Generate new pass
        const passNumber = generatePassNumber(eventName, serial);
        const passResult = await client.query(
          'INSERT INTO passes (registration_id, pass_number, created_by) VALUES ($1, $2, $3) RETURNING pass_id',
          [registrationId, passNumber, req.user?.user_id || null]
        );

        passId = passResult.rows[0].pass_id;

        // Generate QR code (random 10 digit)
        const qrString = generateRandomQRText();

        const qrResult = await client.query(
          'INSERT INTO qr_codes (pass_id, qr_code) VALUES ($1, $2) RETURNING qr_id',
          [passId, qrString]
        );

        qrCodeId = qrResult.rows[0].qr_id;

        console.log(`✅ Pass generated for registration ${registrationId}: ${passNumber}`);
      } else {
        passId = existingPass.rows[0].pass_id;
        // Get existing QR code ID
        const qrResult = await client.query(
          'SELECT qr_id FROM qr_codes WHERE pass_id = $1',
          [passId]
        );
        qrCodeId = qrResult.rows[0]?.qr_id || null;
      }

      // Check if ticket already exists
      const existingTicket = await client.query(
        'SELECT ticket_id FROM tickets WHERE registration_id = $1',
        [registrationId]
      );

      if (existingTicket.rows.length === 0) {
        // Get participant details
        const participantResult = await client.query(
          'SELECT p.participant_id, p.name, p.email, p.phone FROM participants p WHERE p.participant_id = $1',
          [reg.participant_id]
        );
        const participant = participantResult.rows[0];

        // Get event details
        const eventResult = await client.query(
          'SELECT event_id, event_name, start_date_time, address FROM events WHERE event_id = $1',
          [reg.event_id]
        );
        const event = eventResult.rows[0];

        // Get ticket template for event
        const templateResult = await client.query(
          'SELECT template_id FROM ticket_templates WHERE event_id = $1',
          [reg.event_id]
        );
        const templateId = templateResult.rows[0]?.template_id || null;

        // Prepare ticket data from database
        const ticketData = {
          participant_name: participant?.name || '',
          participant_email: participant?.email || '',
          event_name: event?.event_name || '',
          event_date: event?.start_date_time || '',
          event_location: event?.address || '',
          organization: reg.organization || '',
          designation: reg.designation || ''
        };

        // Create ticket
        await client.query(
          `INSERT INTO tickets (registration_id, event_id, participant_id, pass_id, qr_id, template_id, ticket_data, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [registrationId, reg.event_id, reg.participant_id, passId, qrCodeId, templateId, JSON.stringify(ticketData), req.user?.user_id || null]
        );

        console.log(`✅ Ticket generated for registration ${registrationId}`);
      }
    }

    await client.query('COMMIT');

    return sendSuccess(res, updatedRegistration.rows[0], 'Registration status updated successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
