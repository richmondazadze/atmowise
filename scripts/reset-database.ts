import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const migrationClient = postgres(connectionString, { max: 1 });
const db = drizzle(migrationClient);

async function resetDatabase() {
  console.log('🔄 Resetting database to clean state...');

  try {
    // 1. Delete all data in reverse dependency order
    console.log('🗑️ Deleting all data...');
    
    // Delete user interactions first (no foreign key dependencies)
    await db.execute(sql`DELETE FROM user_interactions;`);
    console.log('✅ Deleted user_interactions');
    
    // Delete tips
    await db.execute(sql`DELETE FROM tips;`);
    console.log('✅ Deleted tips');
    
    // Delete symptoms
    await db.execute(sql`DELETE FROM symptoms;`);
    console.log('✅ Deleted symptoms');
    
    // Delete air reads
    await db.execute(sql`DELETE FROM air_reads;`);
    console.log('✅ Deleted air_reads');
    
    // Delete saved places
    await db.execute(sql`DELETE FROM saved_places;`);
    console.log('✅ Deleted saved_places');
    
    // Delete profiles
    await db.execute(sql`DELETE FROM profiles;`);
    console.log('✅ Deleted profiles');
    
    // Delete users
    await db.execute(sql`DELETE FROM users;`);
    console.log('✅ Deleted users');
    
    // Delete resources (if any)
    await db.execute(sql`DELETE FROM resources;`);
    console.log('✅ Deleted resources');

    // 2. Reset sequences (if any)
    console.log('🔄 Resetting sequences...');
    try {
      await db.execute(sql`ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS air_reads_id_seq RESTART WITH 1;`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS symptoms_id_seq RESTART WITH 1;`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS tips_id_seq RESTART WITH 1;`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS resources_id_seq RESTART WITH 1;`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS saved_places_id_seq RESTART WITH 1;`);
      await db.execute(sql`ALTER SEQUENCE IF EXISTS user_interactions_id_seq RESTART WITH 1;`);
      console.log('✅ Sequences reset');
    } catch (error) {
      console.log('ℹ️ No sequences to reset (using UUIDs)');
    }

    // 3. Verify all tables are empty
    console.log('🔍 Verifying database is clean...');
    const tableCounts = await db.execute(sql`
      SELECT 
        'users' as table_name, COUNT(*) as count FROM users
      UNION ALL
      SELECT 'profiles', COUNT(*) FROM profiles
      UNION ALL
      SELECT 'air_reads', COUNT(*) FROM air_reads
      UNION ALL
      SELECT 'symptoms', COUNT(*) FROM symptoms
      UNION ALL
      SELECT 'tips', COUNT(*) FROM tips
      UNION ALL
      SELECT 'resources', COUNT(*) FROM resources
      UNION ALL
      SELECT 'saved_places', COUNT(*) FROM saved_places
      UNION ALL
      SELECT 'user_interactions', COUNT(*) FROM user_interactions;
    `);

    console.log('📊 Table counts after reset:');
    tableCounts.forEach((row: any) => {
      const count = parseInt(row.count);
      const status = count === 0 ? '✅' : '❌';
      console.log(`  ${status} ${row.table_name}: ${count} records`);
    });

    // 4. Check if any data remains
    const totalRecords = tableCounts.reduce((sum: number, row: any) => sum + parseInt(row.count), 0);
    
    if (totalRecords === 0) {
      console.log('🎉 Database successfully reset to clean state!');
      console.log('📋 Ready for real user testing:');
      console.log('  ✅ All test data removed');
      console.log('  ✅ All tables empty');
      console.log('  ✅ Sequences reset');
      console.log('  ✅ Ready for fresh user registration');
    } else {
      console.log('⚠️ Warning: Some data may still remain');
      console.log(`Total records found: ${totalRecords}`);
    }

  } catch (error) {
    console.error('💥 Database reset failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

resetDatabase().catch(console.error);
