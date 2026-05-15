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
    console.log('Starting migration to add checkbox columns to events table...');
    await client.query('BEGIN');

    const columnsToAdd = [
      { name: 'show_event_name', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'show_start_date_time', type: 'BOOLEAN DEFAULT TRUE' }
    ];

    for (const col of columnsToAdd) {
      const existsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = $1
      `, [col.name]);

      if (existsResult.rows.length === 0) {
        console.log(`Adding missing column "${col.name}" to "events" table...`);
        await client.query(`ALTER TABLE events ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`Column "${col.name}" already exists.`);
      }
    }

    await client.query('COMMIT');
    console.log('Migration successful!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}
migrate();
