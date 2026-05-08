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
    console.log('🚀 Adding responses column to event_registrations...');
    await client.query('ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS responses JSONB');
    console.log('✅ Success!');
  } catch (e) {
    console.error('❌ Failed:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
