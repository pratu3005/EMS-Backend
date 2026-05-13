import { query as db } from '../services/db.service.js';

// ═══════════════════════════════════════════════════════════════════════════
// SPONSORS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all sponsors for an event
 */
export const getEventSponsors = async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await db(
      `SELECT s.*, i.url as logo_url, i.file_name, i.alt_text
       FROM sponsors s
       LEFT JOIN images i ON s.logo_image_id = i.image_id
       WHERE s.event_id = $1 AND s.is_active = true
       ORDER BY s.position_order ASC`,
      [eventId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching event sponsors:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get sponsors for a ticket template
 */
export const getTemplateSponsors = async (req, res) => {
  try {
    const { templateId } = req.params;

    const result = await db(
      `SELECT s.*, i.url as logo_url, i.file_name, i.alt_text
       FROM sponsors s
       LEFT JOIN images i ON s.logo_image_id = i.image_id
       WHERE s.template_id = $1 AND s.is_active = true
       ORDER BY s.position_order ASC`,
      [templateId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching template sponsors:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Add a sponsor with image to event/template
 */
export const addSponsor = async (req, res) => {
  try {
    const { 
      eventId, 
      templateId, 
      sponsorName, 
      logoImageId, 
      positionOrder,
      positionX = 0,
      positionY = 0,
      width = 100,
      height = 50
    } = req.body;
    const userId = req.user?.user_id;

    // Validate input
    if (!sponsorName || !logoImageId) {
      return res.status(400).json({
        success: false,
        message: 'Sponsor name and logo image ID are required'
      });
    }

    if (!eventId && !templateId) {
      return res.status(400).json({
        success: false,
        message: 'Either event_id or template_id is required'
      });
    }

    // Verify image exists
    const imageCheck = await db('SELECT image_id FROM images WHERE image_id = $1', [logoImageId]);
    if (imageCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Insert sponsor with position support
    const result = await db(
      `INSERT INTO sponsors (
        event_id, template_id, sponsor_name, logo_image_id, 
        position_order, position_x, position_y, width, height, 
        created_by, created_at, updated_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [
        eventId || null, 
        templateId || null, 
        sponsorName, 
        logoImageId, 
        positionOrder || 0,
        positionX,
        positionY,
        width,
        height,
        userId || null
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Sponsor added successfully'
    });
  } catch (error) {
    console.error('Error adding sponsor:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update sponsor
 */
export const updateSponsor = async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const { 
      sponsorName, 
      logoImageId, 
      positionOrder, 
      isActive,
      positionX,
      positionY,
      width,
      height
    } = req.body;
    const userId = req.user?.user_id;

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (sponsorName !== undefined) {
      updates.push(`sponsor_name = $${paramIndex++}`);
      values.push(sponsorName);
    }
    if (logoImageId !== undefined) {
      updates.push(`logo_image_id = $${paramIndex++}`);
      values.push(logoImageId);
    }
    if (positionOrder !== undefined) {
      updates.push(`position_order = $${paramIndex++}`);
      values.push(positionOrder);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }
    // New: Support drag-drop positioning
    if (positionX !== undefined) {
      updates.push(`position_x = $${paramIndex++}`);
      values.push(positionX);
    }
    if (positionY !== undefined) {
      updates.push(`position_y = $${paramIndex++}`);
      values.push(positionY);
    }
    if (width !== undefined) {
      updates.push(`width = $${paramIndex++}`);
      values.push(width);
    }
    if (height !== undefined) {
      updates.push(`height = $${paramIndex++}`);
      values.push(height);
    }

    updates.push(`updated_by = $${paramIndex++}`);
    values.push(userId || null);

    if (updates.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(sponsorId);
    const query = `UPDATE sponsors SET ${updates.join(', ')}, updated_at = NOW() WHERE sponsor_id = $${paramIndex} RETURNING *`;

    const result = await db(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Sponsor updated successfully'
    });
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete sponsor (soft delete)
 */
export const deleteSponsor = async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const userId = req.user?.user_id;

    const result = await db(
      `UPDATE sponsors SET is_active = false, updated_by = $1, updated_at = NOW() WHERE sponsor_id = $2 RETURNING sponsor_id`,
      [userId || null, sponsorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    res.json({
      success: true,
      message: 'Sponsor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Reorder sponsors
 */
export const reorderSponsors = async (req, res) => {
  try {
    const { sponsors } = req.body; // Array of { sponsor_id, position_order }
    const userId = req.user?.user_id;

    if (!Array.isArray(sponsors) || sponsors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sponsors array is required'
      });
    }

    // Update all sponsors in transaction-like manner
    for (const sponsor of sponsors) {
      await db(
        `UPDATE sponsors SET position_order = $1, updated_by = $2, updated_at = NOW() WHERE sponsor_id = $3`,
        [sponsor.position_order, userId || null, sponsor.sponsor_id]
      );
    }

    res.json({
      success: true,
      message: 'Sponsors reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering sponsors:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
