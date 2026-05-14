import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Setup Database Schema
 * This script initializes the PostgreSQL database with the complete EMS schema
 */
async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database schema setup...\n');

    // Read the db.sql file
    const dbSqlPath = path.resolve(__dirname, '../../db.sql');
    const dbSchema = fs.readFileSync(dbSqlPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = dbSchema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        await client.query(statement);
        successCount++;
        console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
      } catch (error) {
        // Check if it's a "already exists" error (which we can ignore)
        if (
          error.message.includes('already exists') ||
          error.message.includes('already has')
        ) {
          console.log(
            `⏭️  Skipped (already exists): ${statement.substring(0, 60)}...`
          );
          successCount++;
        } else {
          console.error(
            `❌ Error: ${statement.substring(0, 60)}...\n   ${error.message}`
          );
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n✅ Database schema setup completed successfully!');
    } else {
      console.log('\n⚠️  Database schema setup completed with some errors.');
    }

    // Verify tables exist
    console.log('\n📋 Verifying tables...\n');
    const requiredTables = [
      'roles',
      'users',
      'images',
      'events',
      'user_events',
      'participants',
      'event_registrations',
      'status_master',
    ];

    for (const table of requiredTables) {
      const result = await client.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      );
      if (result.rows[0].exists) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' missing`);
      }
    }

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Fatal error during database setup:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
setupDatabase().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
