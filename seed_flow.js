import pool from './src/config/db.js';
import { processRegistration } from './src/services/registration.service.js';

async function seedData() {
  try {
    console.log('🌱 Seeding dummy data...');

    // 1. Create a dummy event if not exists
    const eventRes = await pool.query(
      `INSERT INTO events (event_name, description, start_date_time, end_date_time, address, event_for, is_deleted)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       ON CONFLICT DO NOTHING
       RETURNING event_id`,
      ['Tech Conference 2026', 'A major technology event', '2026-10-10 10:00:00', '2026-10-10 18:00:00', 'Mumbai Convention Center', 'all']
    );

    let eventId;
    if (eventRes.rows.length > 0) {
      eventId = eventRes.rows[0].event_id;
    } else {
      const existingEvent = await pool.query("SELECT event_id FROM events LIMIT 1");
      eventId = existingEvent.rows[0].event_id;
    }

    // 2. Create some dummy registrations
    const dummyParticipants = [
      {
        participant_name: 'John Doe',
        participant_email: 'john@example.com',
        participant_phone: '9876543210',
        event_id: eventId,
        organization: 'Google',
        designation: 'Developer',
        tssia_membership_id: 'MEM-001',
        created_by: 1
      },
      {
        participant_name: 'Jane Smith',
        participant_email: 'jane@example.com',
        participant_phone: '9876543211',
        event_id: eventId,
        organization: 'Microsoft',
        designation: 'Manager',
        tssia_membership_id: 'MEM-002',
        created_by: 1
      }
    ];

    for (const p of dummyParticipants) {
      try {
        const result = await processRegistration(p);
        console.log(`✅ Registered: ${p.participant_name} | Pass: ${result.pass_number}`);
      } catch (err) {
        if (err.message.includes('already registered')) {
          console.log(`ℹ️ ${p.participant_name} is already registered.`);
        } else {
          console.error(`❌ Error registering ${p.participant_name}:`, err.message);
        }
      }
    }

    console.log('🏁 Seeding completed.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    process.exit(0);
  }
}

seedData();
