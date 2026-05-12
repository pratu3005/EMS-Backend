import { config } from '../src/config/env.js';
import pkg from 'pg';
const { Client } = pkg;
const client = new Client({
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
});

try {
  await client.connect();
  const res = await client.query(`
    SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.constraint_schema = kcu.constraint_schema
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.constraint_schema = tc.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'events'
      AND ccu.column_name = 'event_id';
  `);
  console.log(JSON.stringify(res.rows, null, 2));
} catch (err) {
  console.error('ERR', err.message);
} finally {
  await client.end();
}
