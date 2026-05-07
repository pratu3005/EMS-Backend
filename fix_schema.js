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

async function fix() {
  const tables = ['users', 'events', 'participants', 'event_registrations'];
  for (const table of tables) {
    try {
      console.log(`Adding is_deleted to ${table}...`);
      await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`);
    } catch (e) {
      console.error(`Failed to add column to ${table}:`, e.message);
    }
  }
  
  // Also add unique constraint to status_master if missing
  try {
    console.log(`Adding unique constraint to status_master...`);
    await pool.query(`ALTER TABLE status_master ADD CONSTRAINT status_master_type_name_key UNIQUE (type, name)`);
  } catch (e) {
    console.log(`Unique constraint might already exist or failed:`, e.message);
  }

  // Also add unique constraint to roles if missing
  try {
    console.log(`Adding unique constraint to roles...`);
    await pool.query(`ALTER TABLE roles ADD CONSTRAINT roles_name_key UNIQUE (name)`);
  } catch (e) {
    console.log(`Unique constraint might already exist or failed:`, e.message);
  }

  await pool.end();
}
fix();
