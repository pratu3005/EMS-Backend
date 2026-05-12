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

async function checkAndSeed() {
  const client = await pool.connect();
  try {
    console.log('📋 Checking status_master table...\n');
    
    // Check existing statuses
    const existing = await client.query('SELECT status_id, type, name FROM status_master ORDER BY type, name');
    console.log('Current statuses in database:');
    console.table(existing.rows);
    
    if (existing.rows.length === 0) {
      console.log('\n❌ No statuses found! Seeding required statuses...\n');
      
      const requiredStatuses = [
        ['registration', 'pending', 'Pending admin approval'],
        ['registration', 'approved', 'Approved for attendance'],
        ['registration', 'rejected', 'Registration rejected'],
        ['registration', 'waitlisted', 'Added to waitlist'],
        ['attendance', 'no_show', 'Did not attend'],
        ['attendance', 'pending', 'Not yet scanned'],
        ['attendance', 'attended', 'Present at event'],
        ['attendance', 'present', 'Currently present']
      ];
      
      for (const [type, name, desc] of requiredStatuses) {
        await client.query(
          "INSERT INTO status_master (type, name, description) VALUES ($1, $2, $3) ON CONFLICT (type, name) DO NOTHING",
          [type, name, desc]
        );
        console.log(`✅ Inserted: ${type} - ${name}`);
      }
      
      console.log('\n📋 Verification after seeding:');
      const verify = await client.query('SELECT status_id, type, name FROM status_master ORDER BY type, name');
      console.table(verify.rows);
    } else {
      console.log('\n✅ Status master table has data');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndSeed();
