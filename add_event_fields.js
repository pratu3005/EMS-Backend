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

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting migration: Adding new event fields...');
    await client.query('BEGIN');

    const columns = [
      { name: 'capacity', type: 'INTEGER' },
      { name: 'entry_fee', type: 'NUMERIC DEFAULT 0' },
      { name: 'category', type: 'VARCHAR(100)' },
      { name: 'additional_info', type: 'TEXT' },
      { name: 'organizer_name', type: 'VARCHAR(255)' },
      { name: 'organizer_email', type: 'VARCHAR(255)' },
      { name: 'organizer_phone', type: 'VARCHAR(50)' },
      { name: 'organizer_role', type: 'VARCHAR(100)' }
    ];

    for (const col of columns) {
      console.log(`Adding column ${col.name}...`);
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
    }

    await client.query('COMMIT');
    console.log('✅ Migration successful!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
