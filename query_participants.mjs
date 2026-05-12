import { query } from './src/services/db.service.js';
const result = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'participants' ORDER BY ordinal_position");
console.log(JSON.stringify(result.rows, null, 2));
