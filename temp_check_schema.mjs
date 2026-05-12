import { query } from './src/services/db.service.js';
const result = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ticket_templates'");
console.log('TICKET_TEMPLATES columns:', result.rows);
