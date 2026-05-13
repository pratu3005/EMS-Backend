import pool from './src/config/db.js';
async function run() {
  try {
    await pool.query('DROP TABLE IF EXISTS ticket_templates CASCADE');
    console.log("Dropped table");
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
