import pool from './src/config/db.js';

const sql = `
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'tickets';
`;

async function run() {
  try {
    const res = await pool.query(sql);
    console.log('Indices for "tickets":');
    res.rows.forEach(row => {
      console.log(`- ${row.indexname}: ${row.indexdef}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
