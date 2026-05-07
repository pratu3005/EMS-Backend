import pool from '../src/config/db.js';

async function checkSchema() {
  try {
    const q = `
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('passes', 'qr_codes', 'scan_logs', 'event_registrations', 'participants') 
      ORDER BY table_name, ordinal_position
    `;
    const res = await pool.query(q);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkSchema();
