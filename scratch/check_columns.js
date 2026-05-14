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
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'event_registrations' AND table_schema = 'public'");
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}
check();
