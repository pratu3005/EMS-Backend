import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ''),
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
});

async function check() {
  try {
    console.log('📋 Detailed status_master data:\n');
    
    const result = await pool.query(
      `SELECT status_id, type, name, description FROM status_master ORDER BY type, status_id`
    );
    
    console.table(result.rows);
    
    // Check what the registration service is looking for
    console.log('\n🔍 Checking for registration pending status:');
    const regPending = await pool.query(
      "SELECT status_id FROM status_master WHERE type = 'registration' AND name = 'pending'"
    );
    console.log('Found:', regPending.rows);
    
    console.log('\n🔍 Checking for attendance pending status:');
    const attPending = await pool.query(
      "SELECT status_id FROM status_master WHERE type = 'attendance' AND name = 'pending'"
    );
    console.log('Found:', attPending.rows);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
