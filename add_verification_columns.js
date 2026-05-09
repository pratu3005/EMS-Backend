import pool from './src/config/db.js';

async function migrate() {
  console.log('Starting migration: Adding verification columns...');
  
  try {
    // 1. Add columns to event_registrations
    await pool.query(`
      ALTER TABLE event_registrations 
      ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(user_id),
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
    `);
    console.log('Added verified_by and verified_at to event_registrations');

    // 2. Add scan_status to scan_logs
    await pool.query(`
      ALTER TABLE scan_logs 
      ADD COLUMN IF NOT EXISTS scan_status VARCHAR(20);
    `);
    console.log('Added scan_status to scan_logs');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
