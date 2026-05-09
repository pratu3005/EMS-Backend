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

async function run() {
  const client = await pool.connect();
  try {
    // List tables
    const listRes = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
    );
    const tables = listRes.rows.map(r => r.tablename);
    console.log('Tables found:', tables);

    if (tables.length === 0) {
      console.log('No tables to truncate.');
      return;
    }

    // Truncate all tables with cascade
    const tableList = tables.map(t => `"${t}"`).join(', ');
    await client.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
    console.log(`✅ Successfully truncated: ${tableList}`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
