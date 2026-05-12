import { query } from './src/services/db.service.js';
const result = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'images' ORDER BY ordinal_position");
console.log('IMAGES table columns:');
result.rows.forEach(col => console.log('  ' + col.column_name + ': ' + col.data_type));
