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

async function migrateCascadeDeletion() {
  console.log('🔄 Starting cascade deletion migration...');

  try {
    // 1. Update symptoms table foreign key constraints
    console.log('📊 Updating symptoms table foreign key constraints...');
    
    // Drop existing foreign key constraints
    await db.execute(sql`
      ALTER TABLE symptoms 
      DROP CONSTRAINT IF EXISTS symptoms_user_id_fkey;
    `);
    
    await db.execute(sql`
      ALTER TABLE symptoms 
      DROP CONSTRAINT IF EXISTS symptoms_linked_air_id_fkey;
    `);
    
    await db.execute(sql`
      ALTER TABLE symptoms 
      DROP CONSTRAINT IF EXISTS symptoms_linked_air_id_air_reads_id_fk;
    `);
    
    // Add new foreign key constraints with CASCADE
    await db.execute(sql`
      ALTER TABLE symptoms 
      ADD CONSTRAINT symptoms_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    
    await db.execute(sql`
      ALTER TABLE symptoms 
      ADD CONSTRAINT symptoms_linked_air_id_fkey
      FOREIGN KEY (linked_air_id) REFERENCES air_reads(id) ON DELETE CASCADE;
    `);

    // 2. Verify all other tables have CASCADE constraints
    console.log('🔍 Verifying other table constraints...');
    
    // Check profiles table
    await db.execute(sql`
      ALTER TABLE profiles 
      DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
    `);
    await db.execute(sql`
      ALTER TABLE profiles 
      ADD CONSTRAINT profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    
    // Check air_reads table
    await db.execute(sql`
      ALTER TABLE air_reads 
      DROP CONSTRAINT IF EXISTS air_reads_user_id_fkey;
    `);
    await db.execute(sql`
      ALTER TABLE air_reads 
      ADD CONSTRAINT air_reads_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    
    // Check saved_places table
    await db.execute(sql`
      ALTER TABLE saved_places 
      DROP CONSTRAINT IF EXISTS saved_places_user_id_fkey;
    `);
    await db.execute(sql`
      ALTER TABLE saved_places 
      ADD CONSTRAINT saved_places_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    
    // Check user_interactions table
    await db.execute(sql`
      ALTER TABLE user_interactions 
      DROP CONSTRAINT IF EXISTS user_interactions_user_id_fkey;
    `);
    await db.execute(sql`
      ALTER TABLE user_interactions 
      ADD CONSTRAINT user_interactions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);

    // 3. Create a function to clean up orphaned data
    console.log('🧹 Creating cleanup function...');
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
      RETURNS void AS $$
      BEGIN
        -- Delete symptoms with null user_id
        DELETE FROM symptoms WHERE user_id IS NULL;
        
        -- Delete air_reads with null user_id
        DELETE FROM air_reads WHERE user_id IS NULL;
        
        -- Delete saved_places with null user_id
        DELETE FROM saved_places WHERE user_id IS NULL;
        
        -- Delete user_interactions with null user_id
        DELETE FROM user_interactions WHERE user_id IS NULL;
        
        -- Delete profiles with null user_id
        DELETE FROM profiles WHERE user_id IS NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 4. Run cleanup function
    console.log('🧹 Cleaning up orphaned data...');
    await db.execute(sql`SELECT cleanup_orphaned_data();`);

    // 5. Drop cleanup function
    await db.execute(sql`DROP FUNCTION cleanup_orphaned_data();`);

    console.log('✅ Cascade deletion migration completed successfully!');
    console.log('📋 Summary:');
    console.log('  - Updated symptoms table to CASCADE on user deletion');
    console.log('  - Updated symptoms table to CASCADE on air_read deletion');
    console.log('  - Verified all other tables have CASCADE constraints');
    console.log('  - Cleaned up orphaned data');
    console.log('  - Now when a user is deleted, ALL their data will be deleted');

  } catch (error) {
    console.error('💥 Migration script failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

migrateCascadeDeletion().catch(console.error);
