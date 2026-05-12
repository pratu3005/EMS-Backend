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

async function fixStatuses() {
  const client = await pool.connect();
  try {
    console.log('🔧 Fixing missing statuses in status_master...\n');
    
    // Check what attendance statuses we have
    const existing = await client.query(
      "SELECT status_id, name FROM status_master WHERE type = 'attendance' ORDER BY name"
    );
    console.log('Current attendance statuses:');
    console.table(existing.rows);
    
    // Insert missing attendance statuses
    const requiredAttendanceStatuses = [
      ['pending', 'Not yet scanned'],
      ['present', 'Currently present'],
      ['attended', 'Present at event'],
      ['no_show', 'Did not attend']
    ];
    
    console.log('\n📝 Inserting missing attendance statuses:\n');
    for (const [name, desc] of requiredAttendanceStatuses) {
      // Check if exists
      const check = await client.query(
        "SELECT status_id FROM status_master WHERE type = 'attendance' AND name = $1",
        [name]
      );
      
      if (check.rows.length === 0) {
        await client.query(
          "INSERT INTO status_master (type, name, description) VALUES ($1, $2, $3)",
          ['attendance', name, desc]
        );
        console.log(`✅ Inserted: attendance - ${name}`);
      } else {
        console.log(`⏭️  Already exists: attendance - ${name}`);
      }
    }
    
    // Verify
    console.log('\n✅ Final verification:\n');
    const final = await client.query(
      "SELECT status_id, type, name FROM status_master WHERE type IN ('registration', 'attendance') ORDER BY type, name"
    );
    console.table(final.rows);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixStatuses();
