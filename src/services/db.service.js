import pool from '../config/db.js';

// Generic query execution
export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Transactions
export const beginTransaction = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
};

export const commit = async (client) => {
  try {
    await client.query('COMMIT');
  } finally {
    client.release();
  }
};

export const rollback = async (client) => {
  try {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
};

// User queries
export const getUserByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND is_deleted = false',
    [email]
  );
  return result.rows[0] || null;
};

export const getUserById = async (userId) => {
  const result = await query(
    `SELECT u.user_id, u.username, u.email, u.name, u.role_id, r.name as role_name,
            COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
              'event_id', e.event_id, 
              'event_name', e.event_name,
              'description', e.description,
              'start_date_time', e.start_date_time,
              'address', e.address
            )) FILTER (WHERE e.event_id IS NOT NULL), '[]') as assigned_events
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     LEFT JOIN user_events ue ON u.user_id = ue.user_id AND ue.is_deleted = false
     LEFT JOIN events e ON ue.event_id = e.event_id AND e.is_deleted = false
     WHERE u.user_id = $1 AND u.is_deleted = false
     GROUP BY u.user_id, u.username, u.email, u.name, u.role_id, r.name`,
    [userId]
  );
  return result.rows[0] || null;
};

export const createUser = async (name, email, username, password, roleId) => {
  const result = await query(
    'INSERT INTO users (name, email, username, password, role_id, is_deleted, created_at) VALUES ($1, $2, $3, $4, $5, false, NOW()) RETURNING *',
    [name, email, username, password, roleId]
  );
  return result.rows[0];
};

export const getRoleByName = async (roleName) => {
  const result = await query(
    'SELECT * FROM roles WHERE name = $1',
    [roleName]
  );
  return result.rows[0] || null;
};

export const listUsers = async () => {
  const result = await query(
    `SELECT u.user_id, u.username, u.email, u.name, r.name as role_name,
            COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
              'event_id', e.event_id, 
              'event_name', e.event_name,
              'description', e.description,
              'start_date_time', e.start_date_time,
              'address', e.address
            )) FILTER (WHERE e.event_id IS NOT NULL), '[]') as assigned_events
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     LEFT JOIN user_events ue ON u.user_id = ue.user_id AND ue.is_deleted = false
     LEFT JOIN events e ON ue.event_id = e.event_id AND e.is_deleted = false
     WHERE u.is_deleted = false
     GROUP BY u.user_id, u.username, u.email, u.name, r.name
     ORDER BY u.created_at DESC`
  );
  return result.rows;
};

export const assignEventsToUser = async (userId, eventIds) => {
  // First, soft delete old assignments
  await query('UPDATE user_events SET is_deleted = true WHERE user_id = $1', [userId]);
  
  if (eventIds && eventIds.length > 0) {
    for (const eventId of eventIds) {
      await query(
        `INSERT INTO user_events (user_id, event_id) VALUES ($1, $2) 
         ON CONFLICT (user_id, event_id) DO UPDATE SET is_deleted = false`,
        [userId, eventId]
      );
    }
  }
};

export const deleteUser = async (userId) => {
  await query('UPDATE users SET is_deleted = true WHERE user_id = $1', [userId]);
};

// Event queries
export const getAllEvents = async (limit = 10, offset = 0) => {
  const result = await query(
    `SELECT e.*, i.url as image_url, COUNT(er.registration_id) as total_registrations 
     FROM events e 
     LEFT JOIN images i ON e.image_id = i.image_id 
     LEFT JOIN event_registrations er ON e.event_id = er.event_id AND er.is_deleted = false
     WHERE e.is_deleted = false 
     GROUP BY e.event_id, i.url
     ORDER BY e.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

export const getEventCount = async () => {
  const result = await query(
    'SELECT COUNT(*) as total FROM events WHERE is_deleted = false'
  );
  return parseInt(result.rows[0].total, 10);
};

export const getEventById = async (eventId) => {
  const result = await query(
    `SELECT e.*, i.url as image_url FROM events e 
     LEFT JOIN images i ON e.image_id = i.image_id 
     WHERE e.event_id = $1 AND e.is_deleted = false`,
    [eventId]
  );
  return result.rows[0] || null;
};

export const createEvent = async (eventData) => {
  const {
    eventName,
    description,
    startDateTime,
    endDateTime,
    address,
    eventFor,
    imageId,
    capacity,
    entryFee,
    category,
    additionalInfo,
    organizerName,
    organizerEmail,
    organizerPhone,
    organizerRole,
    registrationFields,
    successPageConfig,
    isDraft = true,
    createdBy,
  } = eventData;

  const eventStatus = isDraft ? 'draft' : 'published';
  const draftSavedAt = isDraft ? new Date().toISOString() : null;
  const publishedAt = !isDraft ? new Date().toISOString() : null;

  const result = await query(
    `INSERT INTO events (
      event_name, description, start_date_time, end_date_time, address, 
      event_for, image_id, capacity, entry_fee, category, 
      additional_info, organizer_name, organizer_email, organizer_phone, organizer_role,
      registration_fields, success_page_config,
      is_draft, event_status, draft_saved_at, published_at, created_by,
      is_deleted
    ) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, false) 
     RETURNING *`,
    [
      eventName, description, startDateTime, endDateTime, address, 
      eventFor, imageId, capacity, entryFee, category, 
      additionalInfo, organizerName, organizerEmail, organizerPhone, organizerRole,
      JSON.stringify(registrationFields || []),
      JSON.stringify(successPageConfig || {}),
      isDraft, eventStatus, draftSavedAt, publishedAt, createdBy
    ]
  );
  return result.rows[0];
};

export const updateEvent = async (eventId, eventData) => {
  const {
    eventName,
    description,
    startDateTime,
    endDateTime,
    address,
    eventFor,
    imageId,
    capacity,
    entryFee,
    category,
    additionalInfo,
    organizerName,
    organizerEmail,
    organizerPhone,
    organizerRole,
    registrationFields,
    successPageConfig,
    isDraft,
    updatedBy,
  } = eventData;

  let paramIndex = 1;
  let updateFields = [];
  let params = [];

  // Add base fields
  if (eventName !== undefined) {
    updateFields.push(`event_name = $${paramIndex++}`);
    params.push(eventName);
  }
  if (description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`);
    params.push(description);
  }
  if (startDateTime !== undefined) {
    updateFields.push(`start_date_time = $${paramIndex++}`);
    params.push(startDateTime);
  }
  if (endDateTime !== undefined) {
    updateFields.push(`end_date_time = $${paramIndex++}`);
    params.push(endDateTime);
  }
  if (address !== undefined) {
    updateFields.push(`address = $${paramIndex++}`);
    params.push(address);
  }
  if (eventFor !== undefined) {
    updateFields.push(`event_for = $${paramIndex++}`);
    params.push(eventFor);
  }
  if (imageId !== undefined) {
    updateFields.push(`image_id = $${paramIndex++}`);
    params.push(imageId);
  }
  if (capacity !== undefined) {
    updateFields.push(`capacity = $${paramIndex++}`);
    params.push(capacity);
  }
  if (entryFee !== undefined) {
    updateFields.push(`entry_fee = $${paramIndex++}`);
    params.push(entryFee);
  }
  if (category !== undefined) {
    updateFields.push(`category = $${paramIndex++}`);
    params.push(category);
  }
  if (additionalInfo !== undefined) {
    updateFields.push(`additional_info = $${paramIndex++}`);
    params.push(additionalInfo);
  }
  if (organizerName !== undefined) {
    updateFields.push(`organizer_name = $${paramIndex++}`);
    params.push(organizerName);
  }
  if (organizerEmail !== undefined) {
    updateFields.push(`organizer_email = $${paramIndex++}`);
    params.push(organizerEmail);
  }
  if (organizerPhone !== undefined) {
    updateFields.push(`organizer_phone = $${paramIndex++}`);
    params.push(organizerPhone);
  }
  if (organizerRole !== undefined) {
    updateFields.push(`organizer_role = $${paramIndex++}`);
    params.push(organizerRole);
  }
  if (registrationFields !== undefined) {
    updateFields.push(`registration_fields = $${paramIndex++}`);
    params.push(JSON.stringify(registrationFields || []));
  }
  if (successPageConfig !== undefined) {
    updateFields.push(`success_page_config = $${paramIndex++}`);
    params.push(JSON.stringify(successPageConfig || {}));
  }

  // Handle draft status changes
  if (isDraft !== undefined) {
    const eventStatus = isDraft ? 'draft' : 'published';
    const draftSavedAt = isDraft ? new Date().toISOString() : null;
    const publishedAt = !isDraft ? new Date().toISOString() : null;
    
    updateFields.push(`is_draft = $${paramIndex++}`);
    updateFields.push(`event_status = $${paramIndex++}`);
    updateFields.push(`draft_saved_at = $${paramIndex++}`);
    updateFields.push(`published_at = $${paramIndex++}`);
    params.push(isDraft, eventStatus, draftSavedAt, publishedAt);
  }

  if (updatedBy !== undefined) {
    updateFields.push(`updated_by = $${paramIndex++}`);
    params.push(updatedBy);
  }

  // Add eventId as the last parameter
  params.push(eventId);

  const result = await query(
    `UPDATE events 
     SET ${updateFields.join(', ')}
     WHERE event_id = $${paramIndex}
     RETURNING *`,
    params
  );
  return result.rows[0] || null;
};

export const softDeleteEvent = async (eventId) => {
  const result = await query(
    'UPDATE events SET is_deleted = true WHERE event_id = $1 RETURNING *',
    [eventId]
  );
  return result.rows[0] || null;
};

export const permanentDeleteEvent = async (eventId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const registrationResult = await client.query(
      'SELECT registration_id, participant_id FROM event_registrations WHERE event_id = $1',
      [eventId]
    );

    const registrationIds = registrationResult.rows.map((row) => row.registration_id);
    const participantIds = [...new Set(registrationResult.rows.map((row) => row.participant_id))];

    // Remove scans tied to this event and its registrations
    await client.query('DELETE FROM scan_logs WHERE event_id = $1', [eventId]);

    if (registrationIds.length > 0) {
      await client.query(
        'DELETE FROM custom_field_responses WHERE registration_id = ANY($1)',
        [registrationIds]
      );
      await client.query(
        'DELETE FROM qr_codes WHERE pass_id IN (SELECT pass_id FROM passes WHERE registration_id = ANY($1))',
        [registrationIds]
      );
      await client.query(
        'DELETE FROM passes WHERE registration_id = ANY($1)',
        [registrationIds]
      );
      await client.query(
        'DELETE FROM event_registrations WHERE registration_id = ANY($1)',
        [registrationIds]
      );
    }

    await client.query('DELETE FROM custom_fields WHERE event_id = $1', [eventId]);
    await client.query('DELETE FROM ticket_templates WHERE event_id = $1', [eventId]);
    await client.query('DELETE FROM user_events WHERE event_id = $1', [eventId]);

    const deletedEventResult = await client.query(
      'DELETE FROM events WHERE event_id = $1 RETURNING *',
      [eventId]
    );

    if (participantIds.length > 0) {
      await client.query(
        `DELETE FROM participants p
         WHERE p.participant_id = ANY($1)
           AND NOT EXISTS (
             SELECT 1 FROM event_registrations er
             WHERE er.participant_id = p.participant_id
           )`,
        [participantIds]
      );
    }

    await client.query('COMMIT');
    return deletedEventResult.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get admin's draft event (only one allowed per admin)
export const getAdminDraftEvent = async (userId) => {
  const result = await query(
    `SELECT e.*, i.url as image_url FROM events e 
     LEFT JOIN images i ON e.image_id = i.image_id 
     WHERE e.created_by = $1 AND e.is_draft = true AND e.is_deleted = false`,
    [userId]
  );
  return result.rows[0] || null;
};

// Publish draft event (change from draft to published)
export const publishEvent = async (eventId, userId) => {
  const publishedAt = new Date().toISOString();
  const result = await query(
    `UPDATE events 
     SET is_draft = false, event_status = 'published', published_at = $1, updated_by = $2
     WHERE event_id = $3 AND is_deleted = false
     RETURNING *`,
    [publishedAt, userId, eventId]
  );
  return result.rows[0] || null;
};

// Participant queries
export const getParticipantByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM participants WHERE email = $1 AND is_deleted = false',
    [email]
  );
  return result.rows[0] || null;
};

export const getParticipantById = async (participantId) => {
  const result = await query(
    'SELECT * FROM participants WHERE participant_id = $1 AND is_deleted = false',
    [participantId]
  );
  return result.rows[0] || null;
};

export const createParticipant = async (name, email, phone) => {
  const result = await query(
    'INSERT INTO participants (name, email, phone, is_deleted) VALUES ($1, $2, $3, false) RETURNING *',
    [name, email, phone]
  );
  return result.rows[0];
};

// Registration queries
export const createRegistration = async (registrationData) => {
  const {
    participantId,
    eventId,
    organization,
    designation,
    tssiaMembershipId,
    registrationStatusId,
  } = registrationData;

  const result = await query(
    `INSERT INTO event_registrations (participant_id, event_id, organization, designation, tssia_membership_id, registration_status_id, is_deleted) 
     VALUES ($1, $2, $3, $4, $5, $6, false) 
     RETURNING *`,
    [participantId, eventId, organization, designation, tssiaMembershipId, registrationStatusId]
  );
  return result.rows[0];
};

export const getRegistrationById = async (registrationId) => {
  const result = await query(
    'SELECT * FROM event_registrations WHERE registration_id = $1 AND is_deleted = false',
    [registrationId]
  );
  return result.rows[0] || null;
};

export const checkDuplicateRegistration = async (participantId, eventId) => {
  const result = await query(
    'SELECT * FROM event_registrations WHERE participant_id = $1 AND event_id = $2 AND is_deleted = false',
    [participantId, eventId]
  );
  return result.rows[0] || null;
};

export const getEventRegistrations = async (eventId, limit = 10, offset = 0) => {
  const result = await query(
    `SELECT er.*, p.name as participant_name, p.email as participant_email, p.phone as participant_phone, 
            e.event_name,
            rs.name as registration_status, rs.name as status_name,
            as_status.name as attendance_status,
            ps.pass_number, ps.pass_id,
            qr.qr_code
     FROM event_registrations er 
     JOIN participants p ON er.participant_id = p.participant_id 
     JOIN events e ON er.event_id = e.event_id
     LEFT JOIN status_master rs ON er.registration_status_id = rs.status_id AND rs.type = 'registration'
     LEFT JOIN status_master as_status ON er.attendance_status_id = as_status.status_id AND as_status.type = 'attendance'
     LEFT JOIN passes ps ON er.registration_id = ps.registration_id
     LEFT JOIN qr_codes qr ON ps.pass_id = qr.pass_id
     WHERE er.event_id = $1 AND er.is_deleted = false AND p.is_deleted = false 
     ORDER BY er.created_at DESC LIMIT $2 OFFSET $3`,
    [eventId, limit, offset]
  );
  return result.rows;
};

export const getEventRegistrationCount = async (eventId) => {
  const result = await query(
    'SELECT COUNT(*) as total FROM event_registrations WHERE event_id = $1 AND is_deleted = false',
    [eventId]
  );
  return parseInt(result.rows[0].total, 10);
};

export const getAllRegistrations = async (limit = 10, offset = 0) => {
  const result = await query(
    `SELECT er.*, p.name as participant_name, p.email as participant_email, p.phone as participant_phone, 
            e.event_name, e.start_date_time as event_start_date, e.address as event_address,
            sm.name as status_name, 
            ps.pass_number, qr.qr_code
     FROM event_registrations er 
     JOIN participants p ON er.participant_id = p.participant_id 
     JOIN events e ON er.event_id = e.event_id 
     JOIN status_master sm ON er.registration_status_id = sm.status_id 
     LEFT JOIN passes ps ON er.registration_id = ps.registration_id
     LEFT JOIN qr_codes qr ON ps.pass_id = qr.pass_id
     WHERE er.is_deleted = false AND p.is_deleted = false AND e.is_deleted = false 
     ORDER BY er.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

export const getAllRegistrationCount = async () => {
  const result = await query(
    `SELECT COUNT(*) as total FROM event_registrations er 
     JOIN participants p ON er.participant_id = p.participant_id 
     JOIN events e ON er.event_id = e.event_id 
     WHERE er.is_deleted = false AND p.is_deleted = false AND e.is_deleted = false`
  );
  return parseInt(result.rows[0].total, 10);
};

export const updateRegistrationStatus = async (registrationId, statusId) => {
  const result = await query(
    'UPDATE event_registrations SET registration_status_id = $1, updated_at = NOW() WHERE registration_id = $2 RETURNING *',
    [statusId, registrationId]
  );
  return result.rows[0];
};

// Status queries
export const getStatusByTypeAndName = async (type, name) => {
  const result = await query(
    'SELECT * FROM status_master WHERE type = $1 AND name = $2',
    [type, name]
  );
  return result.rows[0] || null;
};

export const getStatusesByType = async (type) => {
  const result = await query(
    'SELECT * FROM status_master WHERE type = $1',
    [type]
  );
  return result.rows;
};

// Custom fields queries
export const getCustomFieldsByEventId = async (eventId) => {
  const result = await query(
    'SELECT * FROM custom_fields WHERE event_id = $1 ORDER BY custom_id',
    [eventId]
  );
  return result.rows;
};

export const createCustomField = async (eventId, fieldName, fieldType, required) => {
  const result = await query(
    'INSERT INTO custom_fields (event_id, field_name, field_type, required) VALUES ($1, $2, $3, $4) RETURNING *',
    [eventId, fieldName, fieldType, required]
  );
  return result.rows[0];
};

export const saveCustomFieldResponse = async (registrationId, customId, value) => {
  const result = await query(
    'INSERT INTO custom_field_responses (registration_id, custom_id, value) VALUES ($1, $2, $3) RETURNING *',
    [registrationId, customId, value]
  );
  return result.rows[0];
};

export const getCustomFieldResponses = async (registrationId) => {
  const result = await query(
    `SELECT cfr.*, cf.field_name, cf.field_type 
     FROM custom_field_responses cfr 
     JOIN custom_fields cf ON cfr.custom_id = cf.custom_id 
     WHERE cfr.registration_id = $1`,
    [registrationId]
  );
  return result.rows;
};

// Pass queries
export const createPass = async (registrationId, passNumber) => {
  const result = await query(
    'INSERT INTO passes (registration_id, pass_number) VALUES ($1, $2) RETURNING *',
    [registrationId, passNumber]
  );
  return result.rows[0];
};

export const getPassByRegistrationId = async (registrationId) => {
  const result = await query(
    'SELECT * FROM passes WHERE registration_id = $1',
    [registrationId]
  );
  return result.rows[0] || null;
};

export const getPassById = async (passId) => {
  const result = await query(
    'SELECT * FROM passes WHERE pass_id = $1',
    [passId]
  );
  return result.rows[0] || null;
};

// QR Code queries
export const createQRCode = async (passId, qrCode) => {
  const result = await query(
    'INSERT INTO qr_codes (pass_id, qr_code) VALUES ($1, $2) RETURNING *',
    [passId, qrCode]
  );
  return result.rows[0];
};

export const getQRCodeByPassId = async (passId) => {
  const result = await query(
    'SELECT * FROM qr_codes WHERE pass_id = $1',
    [passId]
  );
  return result.rows[0] || null;
};

export const getQRCodeByCode = async (qrCode) => {
  const result = await query(
    'SELECT * FROM qr_codes WHERE qr_code = $1',
    [qrCode]
  );
  return result.rows[0] || null;
};

// Scan log queries
export const createScanLog = async (eventId, registrationId, scannedBy) => {
  const result = await query(
    'INSERT INTO scan_logs (event_id, registration_id, scanned_by) VALUES ($1, $2, $3) RETURNING *',
    [eventId, registrationId, scannedBy]
  );
  return result.rows[0];
};

export const getScanLogsByEventId = async (eventId, limit = 10, offset = 0) => {
  const result = await query(
    `SELECT sl.*, p.name, p.email 
     FROM scan_logs sl 
     JOIN event_registrations er ON sl.registration_id = er.registration_id 
     JOIN participants p ON er.participant_id = p.participant_id 
     WHERE sl.event_id = $1 AND er.is_deleted = false AND p.is_deleted = false 
     ORDER BY sl.created_at DESC LIMIT $2 OFFSET $3`,
    [eventId, limit, offset]
  );
  return result.rows;
};

export const getScanLogCount = async (eventId) => {
  const result = await query(
    'SELECT COUNT(*) as total FROM scan_logs WHERE event_id = $1',
    [eventId]
  );
  return parseInt(result.rows[0].total, 10);
};

// Image queries
export const createImage = async (url, fileName, fileType) => {
  const result = await query(
    'INSERT INTO images (url, file_name, file_type) VALUES ($1, $2, $3) RETURNING *',
    [url, fileName, fileType]
  );
  return result.rows[0];
};

export const getImageById = async (imageId) => {
  const result = await query(
    'SELECT * FROM images WHERE image_id = $1',
    [imageId]
  );
  return result.rows[0] || null;
};
