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

async function inspect() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events'
    `);
    console.log('Columns in events table:');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
  } catch (e) {
    console.error('Error inspecting DB:', e.message);
  } finally {
    await pool.end();
  }
}
inspect();
