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

async function migrate() {
  try {
    console.log("Creating user_events table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_events (
        user_event_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        event_id INTEGER REFERENCES events(event_id),
        created_at TIMESTAMP DEFAULT NOW(),
        is_deleted BOOLEAN DEFAULT false,
        UNIQUE(user_id, event_id)
      )
    `);

    console.log("Adding role 'verifier' if not exists...");
    await pool.query(`
      INSERT INTO roles (name) VALUES ('verifier') ON CONFLICT (name) DO NOTHING
    `);

    console.log("Migration completed.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await pool.end();
  }
}
migrate();
