import pool from '../config/db.js';
import { generatePassNumber, generateRandomQRText } from '../utils/pass.js';
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

    // 0. Get status IDs from status_master
    const regPendingStatus = await client.query(
      "SELECT status_id FROM status_master WHERE type = 'registration' AND name = 'pending'"
    );
    const attPendingStatus = await client.query(
      "SELECT status_id FROM status_master WHERE type = 'attendance' AND name = 'pending'"
    );

    if (regPendingStatus.rows.length === 0) {
      throw new Error('Registration pending status not found in status_master');
    }
    if (attPendingStatus.rows.length === 0) {
      throw new Error('Attendance pending status not found in status_master');
    }

    const regStatusId = regPendingStatus.rows[0].status_id;
    const attStatusId = attPendingStatus.rows[0].status_id;

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
    // Use dynamic status IDs from status_master
    const registration = await client.query(
      `INSERT INTO event_registrations 
       (participant_id, event_id, organization, designation, tssia_membership_id, registration_status_id, attendance_status_id, created_by, responses) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING registration_id`,
      [
        participantId, 
        event_id, 
        organization || registrationData.company_name, 
        designation || registrationData.designation, 
        tssia_membership_id || registrationData.membership_number, 
        regStatusId, attStatusId, created_by,
        JSON.stringify(registrationData)
      ]
    );

    const registrationId = registration.rows[0].registration_id;
    
    // 4. Generate Pass & QR Text
    // Get event name for prefix and count for serial
    const eventInfo = await client.query(
      'SELECT event_name FROM events WHERE event_id = $1',
      [event_id]
    );
    const eventName = eventInfo.rows[0]?.event_name || 'EVT';
    
    const countRes = await client.query(
      'SELECT COUNT(*) FROM event_registrations WHERE event_id = $1',
      [event_id]
    );
    const serial = parseInt(countRes.rows[0].count); // Current count is the serial (since we just inserted)
    
    const passNumber = generatePassNumber(eventName, serial);
    const qrString = generateRandomQRText();

    const pass = await client.query(
      'INSERT INTO passes (registration_id, pass_number, created_by) VALUES ($1, $2, $3) RETURNING pass_id',
      [registrationId, passNumber, created_by]
    );

    const passId = pass.rows[0].pass_id;

    // 5. Save QR Code
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

export const processScan = async (searchCode, scannedBy, eventId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Pre-process searchCode (handle potential JSON string if legacy)
    let actualCode = searchCode;
    try {
      if (searchCode && searchCode.startsWith('{')) {
        const parsed = JSON.parse(searchCode);
        actualCode = parsed.qr_code || parsed.pass_number || searchCode;
      }
    } catch (e) {
      // Not JSON, continue with original string
    }

    // 2. Find registration by QR code OR Pass Number AND Event ID
    const result = await client.query(
      `SELECT er.registration_id, er.event_id, er.registration_status_id, er.attendance_status_id,
              rs.name as registration_status, as_status.name as attendance_status,
              p.name as participant_name, p.email, p.phone,
              e.event_name, e.start_date_time, e.end_date_time, er.organization, er.designation,
              er.tssia_membership_id,
              ps.pass_number
       FROM event_registrations er
       JOIN participants p ON er.participant_id = p.participant_id
       JOIN events e ON er.event_id = e.event_id
       JOIN status_master rs ON er.registration_status_id = rs.status_id
       JOIN status_master as_status ON er.attendance_status_id = as_status.status_id
       LEFT JOIN passes ps ON er.registration_id = ps.registration_id
       LEFT JOIN qr_codes qr ON ps.pass_id = qr.pass_id
       WHERE (qr.qr_code = $1 OR ps.pass_number = $1) 
         AND er.event_id = $2
         AND er.is_deleted = false`,
      [actualCode, eventId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Invalid: Code [${actualCode}] not found`);
    }

    const registration = result.rows[0];

    // 2. Check if registration is Approved
    if (registration.registration_status.toLowerCase() !== 'approved' && 
        registration.registration_status.toLowerCase() !== 'attended') {
      throw new Error(`Invalid: Registration status is ${registration.registration_status}`);
    }

    // 3. Check if scan is within the allowed window (2 hours before start to event end time)
    const eventStartTime = new Date(registration.start_date_time);
    const eventEndTime = new Date(registration.end_date_time);
    const currentTime = new Date();
    const twoHoursBeforeEvent = new Date(eventStartTime.getTime() - (2 * 60 * 60 * 1000));
    
    if (currentTime < twoHoursBeforeEvent) {
      throw new Error(`Scanning not allowed: Event starts at ${eventStartTime.toLocaleString()}. You can scan starting 2 hours before.`);
    }

    if (currentTime > eventEndTime) {
      throw new Error(`Scanning not allowed: Event ended at ${eventEndTime.toLocaleString()}.`);
    }

    // 4. Check for Duplicate
    if (registration.attendance_status.toLowerCase() === 'attended' || 
        registration.attendance_status.toLowerCase() === 'present') {
      
      // Log the duplicate attempt anyway
      await client.query(
        'INSERT INTO scan_logs (event_id, registration_id, scanned_by) VALUES ($1, $2, $3)',
        [registration.event_id, registration.registration_id, scannedBy]
      );
      
      await client.query('COMMIT');
      
      return {
        ...registration,
        scan_timestamp: new Date().toISOString(),
        status: 'duplicate',
        message: 'Already Scanned!'
      };
    }

    // 5. Valid Scan - Mark Attendance
    // Find 'Attended' status ID
    const attendedStatus = await client.query(
      "SELECT status_id FROM status_master WHERE type = 'attendance' AND name = 'attended'"
    );
    const statusId = attendedStatus.rows[0]?.status_id || 10;

    await client.query(
      'UPDATE event_registrations SET attendance_status_id = $1, verified_at = NOW(), verified_by = $3, updated_at = NOW() WHERE registration_id = $2',
      [statusId, registration.registration_id, scannedBy]
    );

    await client.query(
      'INSERT INTO scan_logs (event_id, registration_id, scanned_by) VALUES ($1, $2, $3)',
      [registration.event_id, registration.registration_id, scannedBy]
    );

    await client.query('COMMIT');

    return {
      ...registration,
      scan_timestamp: new Date().toISOString(),
      status: 'valid',
      message: 'Check-in Successful'
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
