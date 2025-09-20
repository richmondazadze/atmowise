#!/usr/bin/env tsx

/**
 * Migration script to update database schema for user-based data organization
 * This script should be run after updating the schema to ensure all data is properly organized
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

async function migrateUserBasedData() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🔄 Starting user-based data migration...');
  
  const sqlClient = postgres(connectionString, { max: 1 });
  const db = drizzle(sqlClient);

  try {
    // 1. Add userId column to air_reads table if it doesn't exist
    console.log('📊 Adding userId column to air_reads table...');
    await sqlClient`
      ALTER TABLE air_reads 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
    `;

    // 2. Create user_interactions table
    console.log('📝 Creating user_interactions table...');
    await sqlClient`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        target_id UUID NOT NULL,
        target_type TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // 3. Create indexes for better performance
    console.log('⚡ Creating indexes...');
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_air_reads_user_id ON air_reads(user_id)
    `;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_air_reads_user_location ON air_reads(user_id, lat, lon)
    `;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_air_reads_timestamp ON air_reads(timestamp)
    `;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id)
    `;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(type)
    `;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at)
    `;

    // 4. Clean up any orphaned data (optional - be careful in production)
    console.log('🧹 Cleaning up orphaned data...');
    
    // Remove air reads without user_id (if any exist from before migration)
    const orphanedAirReads = await sqlClient`
      DELETE FROM air_reads WHERE user_id IS NULL
    `;
    console.log(`🗑️  Removed ${orphanedAirReads.count} orphaned air reads`);

    // 5. Update existing data to have proper constraints
    console.log('🔧 Updating table constraints...');
    
    // Make user_id NOT NULL in air_reads (only if no null values exist)
    await sqlClient`
      ALTER TABLE air_reads 
      ALTER COLUMN user_id SET NOT NULL
    `;

    // Make lat and lon NOT NULL in air_reads
    await sqlClient`
      ALTER TABLE air_reads 
      ALTER COLUMN lat SET NOT NULL,
      ALTER COLUMN lon SET NOT NULL
    `;

    // Make source and timestamp NOT NULL in air_reads
    await sqlClient`
      ALTER TABLE air_reads 
      ALTER COLUMN source SET NOT NULL,
      ALTER COLUMN timestamp SET NOT NULL
    `;

    console.log('✅ Migration completed successfully!');
    console.log('📋 Summary:');
    console.log('  - Added userId column to air_reads table');
    console.log('  - Created user_interactions table');
    console.log('  - Added performance indexes');
    console.log('  - Cleaned up orphaned data');
    console.log('  - Updated table constraints');
    console.log('');
    console.log('🎉 Database is now ready for user-based data organization!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqlClient.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateUserBasedData()
    .then(() => {
      console.log('🚀 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateUserBasedData };
