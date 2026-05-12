import { query } from '../src/services/db.service.js';

const createTicketTemplatesTable = async () => {
  try {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS ticket_templates (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
        template_type VARCHAR(50) NOT NULL DEFAULT 'classic',
        config JSONB NOT NULL DEFAULT '{}',
        custom_text JSONB DEFAULT '{}',
        logo TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(event_id)
      );
    `;
    await query(createQuery);
    console.log('✅ ticket_templates table created successfully');
  } catch (error) {
    console.error('❌ Error creating ticket_templates table:', error);
  }
};

createTicketTemplatesTable();