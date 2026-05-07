import pool from '../config/db.js';
import { generatePassNumber } from '../utils/pass.js';
import { encodeQRData } from '../utils/qr.js';

export const processRegistration = async (registrationData) => {
  const {
    participant_name,
    participant_email,
    participant_phone,
    event_id,
    organization,
    designation,
    tssia_membership_id,
    created_by
  } = registrationData;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if participant exists
    let participantId;
    const participantCheck = await client.query(
      'SELECT participant_id FROM participants WHERE email = $1 AND is_deleted = false',
      [participant_email]
    );

    if (participantCheck.rows.length > 0) {
      participantId = participantCheck.rows[0].participant_id;
    } else {
      // Create new participant
      const newParticipant = await client.query(
        'INSERT INTO participants (name, email, phone, created_by) VALUES ($1, $2, $3, $4) RETURNING participant_id',
        [participant_name, participant_email, participant_phone, created_by]
      );
      participantId = newParticipant.rows[0].participant_id;
    }

    // 2. Prevent duplicate registration
    const duplicateCheck = await client.query(
      'SELECT registration_id FROM event_registrations WHERE participant_id = $1 AND event_id = $2 AND is_deleted = false',
      [participantId, event_id]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error('Participant is already registered for this event');
    }

    // 3. Create event registration
    // Default status: pending (6)
    const registration = await client.query(
      `INSERT INTO event_registrations 
       (participant_id, event_id, organization, designation, tssia_membership_id, registration_status_id, attendance_status_id, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING registration_id`,
      [participantId, event_id, organization, designation, tssia_membership_id, 6, 9, created_by]
    );

    const registrationId = registration.rows[0].registration_id;

    // 4. Generate Pass
    const passNumber = generatePassNumber();
    const pass = await client.query(
      'INSERT INTO passes (registration_id, pass_number, created_by) VALUES ($1, $2, $3) RETURNING pass_id',
      [registrationId, passNumber, created_by]
    );

    const passId = pass.rows[0].pass_id;

    // 5. Generate QR Code
    const qrData = {
      registration_id: registrationId,
      pass_number: passNumber
    };
    const qrString = encodeQRData(qrData);

    await client.query(
      'INSERT INTO qr_codes (pass_id, qr_code) VALUES ($1, $2)',
      [passId, qrString]
    );

    await client.query('COMMIT');

    return {
      registration_id: registrationId,
      pass_number: passNumber,
      qr_code: qrString
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getPassDetails = async (registrationId) => {
  const result = await pool.query(
    `SELECT 
        p.name as participant_name, p.email, p.phone,
        e.event_name, e.start_date_time, e.address,
        ps.pass_number,
        qr.qr_code
     FROM event_registrations er
     JOIN participants p ON er.participant_id = p.participant_id
     JOIN events e ON er.event_id = e.event_id
     JOIN passes ps ON er.registration_id = ps.registration_id
     JOIN qr_codes qr ON ps.pass_id = qr.pass_id
     WHERE er.registration_id = $1 AND er.is_deleted = false`,
    [registrationId]
  );

  if (result.rows.length === 0) {
    throw new Error('Pass not found');
  }

  return result.rows[0];
};

export const processScan = async (qrString, scannedBy) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Find pass by QR code
    const qrResult = await client.query(
      `SELECT qr.pass_id, ps.registration_id, ps.pass_number, er.event_id, er.registration_status_id, er.attendance_status_id
       FROM qr_codes qr
       JOIN passes ps ON qr.pass_id = ps.pass_id
       JOIN event_registrations er ON ps.registration_id = er.registration_id
       WHERE qr.qr_code = $1 AND er.is_deleted = false`,
      [qrString]
    );

    if (qrResult.rows.length === 0) {
      throw new Error('Invalid QR code');
    }

    const { registration_id, event_id, pass_number, registration_status_id, attendance_status_id } = qrResult.rows[0];

    // 2. Prevent duplicate scan (optional)
    // Check if already present (attendance status 10)
    if (attendance_status_id == 10) {
       // throw new Error('Attendance already marked for this participant');
       // Actually, maybe we allow re-scanning but just log it.
       // User asked to "Prevent duplicate scan (optional)".
    }

    // 3. Insert into scan logs
    await client.query(
      'INSERT INTO scan_logs (event_id, registration_id, scanned_by) VALUES ($1, $2, $3)',
      [event_id, registration_id, scannedBy]
    );

    // 4. Update attendance status to 'present' (10)
    await client.query(
      'UPDATE event_registrations SET attendance_status_id = 10, updated_at = NOW() WHERE registration_id = $1',
      [registration_id]
    );

    // Get complete details for the response
    const infoResult = await client.query(
      `SELECT 
          p.name as participant_name, p.email, p.phone,
          e.event_name,
          er.organization, er.designation,
          ps.pass_number
       FROM event_registrations er
       JOIN participants p ON er.participant_id = p.participant_id
       JOIN events e ON er.event_id = e.event_id
       JOIN passes ps ON er.registration_id = ps.registration_id
       WHERE er.registration_id = $1`,
      [registration_id]
    );

    await client.query('COMMIT');

    return {
      participant_name: infoResult.rows[0].participant_name,
      email: infoResult.rows[0].email,
      phone: infoResult.rows[0].phone,
      event_name: infoResult.rows[0].event_name,
      organization: infoResult.rows[0].organization,
      designation: infoResult.rows[0].designation,
      pass_number: infoResult.rows[0].pass_number,
      scan_timestamp: new Date().toISOString(),
      status: attendance_status_id == 10 ? 'duplicate' : 'valid'
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
