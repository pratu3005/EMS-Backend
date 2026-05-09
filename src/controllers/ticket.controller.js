import pool from '../config/db.js';

export const saveTemplate = async (req, res) => {
  const { event_id, template_type, config } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO ticket_templates (event_id, template_type, template_name, config, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (event_id) 
       DO UPDATE SET 
          template_type = EXCLUDED.template_type, 
          template_name = EXCLUDED.template_name, 
          config = EXCLUDED.config, 
          updated_at = NOW()
       RETURNING *`,
      [event_id, template_type, template_type, config]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getTemplate = async (req, res) => {
  const { eventId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM ticket_templates WHERE event_id = $1`,
      [eventId]
    );
    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
