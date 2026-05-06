import pkg from 'pg';
const { Pool } = pkg;
import { config } from './env.js';

// Ensure password is a string
const poolConfig = {
  user: config.DB_USER,
  password: String(config.DB_PASSWORD || ''),
  host: config.DB_HOST,
  port: parseInt(config.DB_PORT, 10) || 5432,
  database: config.DB_NAME,
};

console.log('🔌 Database Configuration:');
console.log(`   User: ${poolConfig.user}`);
console.log(`   Host: ${poolConfig.host}:${poolConfig.port}`);
console.log(`   Database: ${poolConfig.database}`);
console.log('');

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Test connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Database connection failed:');
    console.error(err.message);
  } else {
    console.log('✅ Database connected successfully at ' + result.rows[0].now);
  }
});

export default pool;
