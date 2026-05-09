import pool from './src/config/db.js';

async function checkData() {
  try {
    const events = await pool.query('SELECT COUNT(*) as total, is_deleted FROM events GROUP BY is_deleted');
    console.log('Events counts:', events.rows);

    const registrations = await pool.query('SELECT COUNT(*) as total, is_deleted FROM event_registrations GROUP BY is_deleted');
    console.log('Registrations counts:', registrations.rows);

    const participants = await pool.query('SELECT COUNT(*) as total, is_deleted FROM participants GROUP BY is_deleted');
    console.log('Participants counts:', participants.rows);

    if (events.rows.length > 0) {
        const sampleEvents = await pool.query('SELECT event_id, event_name, is_deleted FROM events LIMIT 5');
        console.log('Sample Events:', sampleEvents.rows);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkData();
