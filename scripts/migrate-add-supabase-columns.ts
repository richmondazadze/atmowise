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

async function migrateAddSupabaseColumns() {
  console.log('🔄 Adding Supabase columns to users table...');

  try {
    // 1. Add supabase_id column to users table
    console.log('📊 Adding supabase_id column...');
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS supabase_id TEXT UNIQUE;
    `);

    // 2. Add email column to users table
    console.log('📧 Adding email column...');
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email TEXT;
    `);

    // 3. Create index on supabase_id for faster lookups
    console.log('🔍 Creating index on supabase_id...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_supabase_id 
      ON users(supabase_id);
    `);

    // 4. Create index on email for faster lookups
    console.log('🔍 Creating index on email...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON users(email);
    `);

    // 5. Verify the changes
    console.log('✅ Verifying changes...');
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Users table columns:');
    columns.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    console.log('✅ Supabase columns migration completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

migrateAddSupabaseColumns().catch(console.error);
