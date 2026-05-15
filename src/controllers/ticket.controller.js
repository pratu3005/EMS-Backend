import { query as db } from '../services/db.service.js';
import pool from '../config/db.js';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET TEMPLATE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

export const getTicketTemplate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const query = `
      SELECT * FROM ticket_templates
      WHERE event_id = $1
    `;
    const result = await db(query, [eventId]);
    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.json({ success: false, message: 'No template found' });
    }
  } catch (error) {
    console.error('Error fetching ticket template:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllTicketTemplates = async (req, res) => {
  try {
    const query = `
      SELECT * FROM ticket_templates
      ORDER BY updated_at DESC
    `;
    const result = await db(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching ticket templates:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const saveTicketTemplate = async (req, res) => {
  try {
    const { event_id, template_type, config, customText, logo } = req.body;
    const query = `
      INSERT INTO ticket_templates (event_id, template_type, config, custom_text, logo, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (event_id)
      DO UPDATE SET
        template_type = EXCLUDED.template_type,
        config = EXCLUDED.config,
        custom_text = EXCLUDED.custom_text,
        logo = EXCLUDED.logo,
        updated_at = NOW()
    `;
    await db(query, [event_id, template_type, JSON.stringify(config), JSON.stringify(customText), logo]);
    res.json({ success: true, message: 'Template saved successfully' });
  } catch (error) {
    console.error('Error saving ticket template:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TICKET MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// Get ticket by ticket ID
export const getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const result = await db(
      `SELECT t.*, p.pass_number, qr.qr_code, 
              e.event_name, e.start_date_time, e.address,
              pt.name as participant_name, pt.email as participant_email, pt.phone as participant_phone,
              reg.organization, reg.designation
       FROM tickets t
       JOIN passes p ON t.pass_id = p.pass_id
       JOIN qr_codes qr ON t.qr_id = qr.qr_id
       JOIN events e ON t.event_id = e.event_id
       JOIN participants pt ON t.participant_id = pt.participant_id
       JOIN event_registrations reg ON t.registration_id = reg.registration_id
       WHERE t.ticket_id = $1 AND t.is_deleted = FALSE`,
      [ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get tickets by event ID
export const getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const search = req.query.search || "";

    const countQuery = `
      SELECT COUNT(*) 
      FROM tickets t
      JOIN participants pt ON t.participant_id = pt.participant_id
      JOIN events e ON t.event_id = e.event_id
      WHERE t.event_id = $1 AND t.is_deleted = FALSE
      AND (pt.name ILIKE $2 OR e.event_name ILIKE $2)
    `;
    const countResult = await db(countQuery, [eventId, `%${search}%`]);
    const total = parseInt(countResult.rows[0].count);

    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    const allowedSortFields = ['created_at', 'participant_name', 'event_name', 'pass_number'];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

    const query = `
      SELECT t.*, p.pass_number, qr.qr_code,
             e.event_name, e.start_date_time, e.address,
             pt.name as participant_name, pt.email as participant_email, pt.phone as participant_phone,
             reg.organization, reg.designation
      FROM tickets t
      JOIN passes p ON t.pass_id = p.pass_id
      JOIN qr_codes qr ON t.qr_id = qr.qr_id
      JOIN events e ON t.event_id = e.event_id
      JOIN participants pt ON t.participant_id = pt.participant_id
      JOIN event_registrations reg ON t.registration_id = reg.registration_id
      WHERE t.event_id = $1 AND t.is_deleted = FALSE
      AND (pt.name ILIKE $4 OR e.event_name ILIKE $4)
      ORDER BY ${finalSortBy === 'participant_name' ? 'pt.name' : (finalSortBy === 'event_name' ? 'e.event_name' : (finalSortBy === 'pass_number' ? 'p.pass_number' : 't.created_at'))} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;

    const result = await db(query, [eventId, pageSize, offset, `%${search}%`]);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get tickets by registration ID
export const getRegistrationTicket = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const result = await db(
      `SELECT t.*, p.pass_number, qr.qr_code,
              e.event_name, e.start_date_time, e.address,
              pt.name as participant_name, pt.email as participant_email, pt.phone as participant_phone,
              reg.organization, reg.designation
       FROM tickets t
       JOIN passes p ON t.pass_id = p.pass_id
       JOIN qr_codes qr ON t.qr_id = qr.qr_id
       JOIN events e ON t.event_id = e.event_id
       JOIN participants pt ON t.participant_id = pt.participant_id
       JOIN event_registrations reg ON t.registration_id = reg.registration_id
       WHERE t.registration_id = $1 AND t.is_deleted = FALSE`,
      [registrationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found for this registration' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching registration ticket:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all tickets
export const getAllTickets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const search = req.query.search || "";

    const countQuery = `
      SELECT COUNT(*) 
      FROM tickets t
      JOIN participants pt ON t.participant_id = pt.participant_id
      JOIN events e ON t.event_id = e.event_id
      WHERE t.is_deleted = FALSE
      AND (pt.name ILIKE $1 OR e.event_name ILIKE $1)
    `;
    const countResult = await db(countQuery, [`%${search}%`]);
    const total = parseInt(countResult.rows[0].count);

    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    const allowedSortFields = ['created_at', 'participant_name', 'event_name', 'pass_number'];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

    const query = `
      SELECT t.*, p.pass_number, qr.qr_code,
              e.event_name, e.start_date_time, e.address,
              pt.name as participant_name, pt.email as participant_email, pt.phone as participant_phone,
              reg.organization, reg.designation
      FROM tickets t
      JOIN passes p ON t.pass_id = p.pass_id
      JOIN qr_codes qr ON t.qr_id = qr.qr_id
      JOIN events e ON t.event_id = e.event_id
      JOIN participants pt ON t.participant_id = pt.participant_id
      JOIN event_registrations reg ON t.registration_id = reg.registration_id
      WHERE t.is_deleted = FALSE
      AND (pt.name ILIKE $3 OR e.event_name ILIKE $3)
      ORDER BY ${finalSortBy === 'participant_name' ? 'pt.name' : (finalSortBy === 'event_name' ? 'e.event_name' : (finalSortBy === 'pass_number' ? 'p.pass_number' : 't.created_at'))} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;

    const result = await db(query, [pageSize, offset, `%${search}%`]);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark ticket as downloaded
export const markTicketDownloaded = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const result = await db(
      `UPDATE tickets 
       SET is_downloaded = TRUE, downloaded_at = NOW(), updated_at = NOW()
       WHERE ticket_id = $1 AND is_deleted = FALSE
       RETURNING *`,
      [ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket marked as downloaded', data: result.rows[0] });
  } catch (error) {
    console.error('Error marking ticket as downloaded:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark ticket as printed
export const markTicketPrinted = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const result = await db(
      `UPDATE tickets 
       SET is_printed = TRUE, printed_at = NOW(), updated_at = NOW()
       WHERE ticket_id = $1 AND is_deleted = FALSE
       RETURNING *`,
      [ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket marked as printed', data: result.rows[0] });
  } catch (error) {
    console.error('Error marking ticket as printed:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update ticket data
export const updateTicketData = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { ticket_data } = req.body;

    const result = await db(
      `UPDATE tickets 
       SET ticket_data = $1, updated_at = NOW()
       WHERE ticket_id = $2 AND is_deleted = FALSE
       RETURNING *`,
      [JSON.stringify(ticket_data), ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket data updated', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating ticket data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete ticket (soft delete)
export const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const result = await db(
      `UPDATE tickets 
       SET is_deleted = TRUE, updated_at = NOW()
       WHERE ticket_id = $1
       RETURNING *`,
      [ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};