import pool from '../src/config/db.js';
import { hashPassword } from '../src/services/auth.service.js';

/**
 * Seed Database with Sample Verifier Data
 * Creates test verifiers and assigns them to events
 */
async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...\n');

    await client.query('BEGIN');

    // 1. Ensure roles exist
    console.log('📌 Setting up roles...');
    const roles = ['admin', 'verifier', 'user'];
    for (const role of roles) {
      await client.query(
        `INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [role]
      );
      console.log(`   ✅ Role '${role}' ready`);
    }

    // 2. Get role IDs
    const adminRoleResult = await client.query(
      `SELECT role_id FROM roles WHERE name = 'admin' LIMIT 1`
    );
    const verifierRoleResult = await client.query(
      `SELECT role_id FROM roles WHERE name = 'verifier' LIMIT 1`
    );

    const adminRoleId = adminRoleResult.rows[0]?.role_id;
    const verifierRoleId = verifierRoleResult.rows[0]?.role_id;

    if (!adminRoleId || !verifierRoleId) {
      throw new Error('Failed to fetch role IDs');
    }

    // 3. Create or update admin user
    console.log('\n📌 Setting up admin user...');
    const adminPassword = await hashPassword('Admin@123');
    const adminResult = await client.query(
      `INSERT INTO users (name, email, username, password, role_id, is_active, is_deleted)
       VALUES ($1, $2, $3, $4, $5, true, false)
       ON CONFLICT (email) DO UPDATE SET password = $4
       RETURNING user_id, email`,
      [
        'Admin User',
        'admin@ems.com',
        'admin',
        adminPassword,
        adminRoleId,
      ]
    );
    const adminId = adminResult.rows[0].user_id;
    console.log(`   ✅ Admin user ready: ${adminResult.rows[0].email}`);

    // 4. Create test verifiers
    console.log('\n📌 Setting up test verifiers...');
    const verifiers = [
      {
        name: 'John Verifier',
        email: 'john.verifier@ems.com',
        username: 'john_verifier',
      },
      {
        name: 'Sarah Checker',
        email: 'sarah.checker@ems.com',
        username: 'sarah_checker',
      },
      {
        name: 'Mike Inspector',
        email: 'mike.inspector@ems.com',
        username: 'mike_inspector',
      },
    ];

    const verifierIds = [];
    for (const verifier of verifiers) {
      const verifierPassword = await hashPassword('Verifier@123');
      const result = await client.query(
        `INSERT INTO users (name, email, username, password, role_id, is_active, is_deleted)
         VALUES ($1, $2, $3, $4, $5, true, false)
         ON CONFLICT (email) DO UPDATE SET password = $4
         RETURNING user_id, email`,
        [
          verifier.name,
          verifier.email,
          verifier.username,
          verifierPassword,
          verifierRoleId,
        ]
      );
      verifierIds.push(result.rows[0].user_id);
      console.log(`   ✅ Verifier ready: ${verifier.email}`);
    }

    // 5. Create test events
    console.log('\n📌 Setting up test events...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // 7 days from now
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 4);

    const events = [
      {
        event_name: 'Tech Conference 2026',
        description: 'Annual technology conference',
        start_date_time: startDate.toISOString(),
        end_date_time: endDate.toISOString(),
        address: '123 Tech Street, San Francisco, CA',
      },
      {
        event_name: 'Business Summit',
        description: 'Business networking and learning event',
        start_date_time: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        end_date_time: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        address: '456 Business Ave, New York, NY',
      },
      {
        event_name: 'Web Development Workshop',
        description: 'Hands-on workshop for web developers',
        start_date_time: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        end_date_time: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        address: '789 Developer Lane, Austin, TX',
      },
    ];

    const eventIds = [];
    for (const event of events) {
      const result = await client.query(
        `INSERT INTO events (
          event_name, description, start_date_time, end_date_time, address,
          event_status, is_draft, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING event_id`,
        [
          event.event_name,
          event.description,
          event.start_date_time,
          event.end_date_time,
          event.address,
          'published',
          false,
          adminId,
        ]
      );
      eventIds.push(result.rows[0].event_id);
      console.log(`   ✅ Event created: ${event.event_name}`);
    }

    // 6. Assign events to verifiers
    console.log('\n📌 Assigning events to verifiers...');
    // John gets first two events
    await client.query(
      `INSERT INTO user_events (user_id, event_id, is_deleted)
       VALUES ($1, $2, false), ($1, $3, false)
       ON CONFLICT (user_id, event_id) DO UPDATE SET is_deleted = false`,
      [verifierIds[0], eventIds[0], eventIds[1]]
    );
    console.log(`   ✅ Assigned 2 events to ${verifiers[0].name}`);

    // Sarah gets all three events
    await client.query(
      `INSERT INTO user_events (user_id, event_id, is_deleted)
       VALUES ($1, $2, false), ($1, $3, false), ($1, $4, false)
       ON CONFLICT (user_id, event_id) DO UPDATE SET is_deleted = false`,
      [verifierIds[1], eventIds[0], eventIds[1], eventIds[2]]
    );
    console.log(`   ✅ Assigned 3 events to ${verifiers[1].name}`);

    // Mike gets last event
    await client.query(
      `INSERT INTO user_events (user_id, event_id, is_deleted)
       VALUES ($1, $2, false)
       ON CONFLICT (user_id, event_id) DO UPDATE SET is_deleted = false`,
      [verifierIds[2], eventIds[2]]
    );
    console.log(`   ✅ Assigned 1 event to ${verifiers[2].name}`);

    await client.query('COMMIT');

    console.log('\n✅ Database seeding completed successfully!\n');

    // Display test credentials
    console.log('📋 Test Credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@ems.com');
    console.log('     Password: Admin@123\n');

    verifiers.forEach((verifier, index) => {
      console.log(`   Verifier ${index + 1} (${verifier.name}):`);
      console.log(`     Email: ${verifier.email}`);
      console.log(`     Password: Verifier@123`);
    });

    console.log('\n✅ You can now login with these credentials!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedDatabase().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
