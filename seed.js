import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ''),
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting seed process...');
    await client.query('BEGIN');

    // 1. Roles
    console.log('Creating roles...');
    async function getOrCreateRole(name) {
      const existing = await client.query("SELECT role_id FROM roles WHERE name = $1", [name]);
      if (existing.rows.length > 0) return existing.rows[0].role_id;
      const result = await client.query("INSERT INTO roles (name) VALUES ($1) RETURNING role_id", [name]);
      return result.rows[0].role_id;
    }
    
    const adminRoleId = await getOrCreateRole('admin');
    const verifierRoleId = await getOrCreateRole('verifier');

    // 2. Status Master
    console.log('Creating status master...');
    const statuses = [
      ['registration', 'pending'],
      ['registration', 'approved'],
      ['registration', 'rejected'],
      ['attendance', 'absent'],
      ['attendance', 'present']
    ];
    
    for (const [type, name] of statuses) {
      const existing = await client.query("SELECT status_id FROM status_master WHERE type = $1 AND name = $2", [type, name]);
      if (existing.rows.length === 0) {
        await client.query("INSERT INTO status_master (type, name) VALUES ($1, $2)", [type, name]);
      }
    }

    const regPending = (await client.query("SELECT status_id FROM status_master WHERE type = 'registration' AND name = 'pending'")).rows[0].status_id;
    const regApproved = (await client.query("SELECT status_id FROM status_master WHERE type = 'registration' AND name = 'approved'")).rows[0].status_id;
    const attPresent = (await client.query("SELECT status_id FROM status_master WHERE type = 'attendance' AND name = 'present'")).rows[0].status_id;

    // 3. Admin User
    console.log('Creating admin user...');
    const hashedPw = await bcrypt.hash('admin123', 10);
    await client.query(
      "INSERT INTO users (name, email, password, role_id, is_deleted, created_at) VALUES ($1, $2, $3, $4, false, NOW()) ON CONFLICT (email) DO NOTHING",
      ['System Admin', 'admin@ems.com', hashedPw, adminRoleId]
    );

    // 4. Events
    console.log('Creating sample events...');
    const event1 = await client.query(
      `INSERT INTO events (event_name, description, start_date_time, end_date_time, address, event_for, is_deleted, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW()) RETURNING event_id`,
      ['Global Tech Summit 2026', 'The largest technology conference in Asia.', '2026-06-15 09:00:00', '2026-06-17 18:00:00', 'Bandra Kurla Complex, Mumbai', 'all']
    );

    const event2 = await client.query(
      `INSERT INTO events (event_name, description, start_date_time, end_date_time, address, event_for, is_deleted, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW()) RETURNING event_id`,
      ['TSSIA Annual Meet', 'Annual general meeting for TSSIA members.', '2026-07-10 10:00:00', '2026-07-10 16:00:00', 'TSSIA Hall, Thane', 'tssia_members']
    );

    const e1Id = event1.rows[0].event_id;
    const e2Id = event2.rows[0].event_id;

    // 5. Participants & Registrations
    console.log('Creating participants and registrations...');
    const participants = [
      ['John Doe', 'john@example.com', '9876543210'],
      ['Jane Smith', 'jane@example.com', '9876543211'],
      ['Bob Wilson', 'bob@example.com', '9876543212']
    ];

    for (const [name, email, phone] of participants) {
      const p = await client.query(
        "INSERT INTO participants (name, email, phone, is_deleted) VALUES ($1, $2, $3, false) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING participant_id",
        [name, email, phone]
      );
      const pId = p.rows[0].participant_id;

      // Register for Event 1
      const reg = await client.query(
        "INSERT INTO event_registrations (participant_id, event_id, registration_status_id, attendance_status_id, is_deleted, created_at) VALUES ($1, $2, $3, $4, false, NOW()) RETURNING registration_id",
        [pId, e1Id, regApproved, attPresent]
      );
      
      const regId = reg.rows[0].registration_id;

      // Add a scan log for John
      if (name === 'John Doe') {
        await client.query(
          "INSERT INTO scan_logs (event_id, registration_id, scanned_at) VALUES ($1, $2, NOW())",
          [e1Id, regId]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Seed successful!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
