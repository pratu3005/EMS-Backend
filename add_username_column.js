import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'eventsystem',
});

async function migrate() {
  try {
    console.log('Starting migration: adding username to users table...');
    
    // Check if column exists first
    const checkCol = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='username'
    `);

    if (checkCol.rows.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN username VARCHAR(255)');
      console.log('Column "username" added successfully.');
    } else {
      console.log('Column "username" already exists.');
    }

    await pool.end();
    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
