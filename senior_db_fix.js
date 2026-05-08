import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ''),
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
});

async function fixDatabase() {
  const client = await pool.connect();
  try {
    console.log('🚀 Senior Dev Analysis: Starting database schema verification...');
    await client.query('BEGIN');

    // 1. Verify and fix 'events' table
    console.log('--- Checking "events" table ---');
    const eventColumns = [
      { name: 'registration_fields', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'success_page_config', type: 'JSONB DEFAULT \'{}\'' },
      { name: 'capacity', type: 'INTEGER' },
      { name: 'entry_fee', type: 'NUMERIC DEFAULT 0' },
      { name: 'category', type: 'VARCHAR(100) DEFAULT \'EVENT\'' },
      { name: 'additional_info', type: 'TEXT' },
      { name: 'organizer_name', type: 'VARCHAR(255)' },
      { name: 'organizer_email', type: 'VARCHAR(255)' },
      { name: 'organizer_phone', type: 'VARCHAR(50)' },
      { name: 'organizer_role', type: 'VARCHAR(100)' }
    ];

    for (const col of eventColumns) {
      const existsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = $1
      `, [col.name]);

      if (existsResult.rows.length === 0) {
        console.log(`[FIX] Adding missing column "${col.name}" to "events" table...`);
        await client.query(`ALTER TABLE events ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`[OK] Column "${col.name}" exists.`);
      }
    }

    // 2. Verify and fix 'event_registrations' table
    console.log('\n--- Checking "event_registrations" table ---');
    const regColumns = [
      { name: 'responses', type: 'JSONB DEFAULT \'{}\'' },
      { name: 'organization', type: 'VARCHAR(255)' },
      { name: 'designation', type: 'VARCHAR(255)' },
      { name: 'tssia_membership_id', type: 'VARCHAR(100)' }
    ];

    for (const col of regColumns) {
      const existsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'event_registrations' AND column_name = $1
      `, [col.name]);

      if (existsResult.rows.length === 0) {
        console.log(`[FIX] Adding missing column "${col.name}" to "event_registrations" table...`);
        await client.query(`ALTER TABLE event_registrations ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`[OK] Column "${col.name}" exists.`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Database schema successfully synchronized!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error during database fix:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixDatabase();
