import { query } from '../src/services/db.service.js';

const createTicketsTable = async () => {
  try {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS tickets (
        ticket_id SERIAL PRIMARY KEY,
        registration_id INTEGER NOT NULL UNIQUE REFERENCES event_registrations(registration_id) ON DELETE CASCADE,
        event_id INTEGER NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
        participant_id INTEGER NOT NULL REFERENCES participants(participant_id) ON DELETE CASCADE,
        pass_id BIGINT REFERENCES passes(pass_id),
        qr_id BIGINT REFERENCES qr_codes(qr_id),
        template_id BIGINT REFERENCES ticket_templates(template_id),
        ticket_data JSONB DEFAULT '{}',
        is_downloaded BOOLEAN DEFAULT FALSE,
        downloaded_at TIMESTAMP,
        is_printed BOOLEAN DEFAULT FALSE,
        printed_at TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_by BIGINT REFERENCES users(user_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tickets_registration_id ON tickets(registration_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_participant_id ON tickets(participant_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_pass_id ON tickets(pass_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_template_id ON tickets(template_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
      CREATE INDEX IF NOT EXISTS idx_tickets_is_deleted ON tickets(is_deleted);
    `;
    await query(createQuery);
    console.log('✅ tickets table created successfully');
  } catch (error) {
    console.error('❌ Error creating tickets table:', error);
    throw error;
  }
};

createTicketsTable();
