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

async function migrateAddTipsUserId() {
  console.log('🔄 Adding user_id column to tips table...');

  try {
    // 1. Add user_id column to tips table
    console.log('📊 Adding user_id column...');
    await db.execute(sql`
      ALTER TABLE tips 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    `);

    // 2. Create index on user_id for faster lookups
    console.log('🔍 Creating index on user_id...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_tips_user_id 
      ON tips(user_id);
    `);

    // 3. Verify the changes
    console.log('✅ Verifying changes...');
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tips'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Tips table columns:');
    columns.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 4. Check foreign key constraints
    console.log('🔗 Checking foreign key constraints...');
    const constraints = await db.execute(sql`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND tc.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
        AND tc.table_schema = rc.constraint_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
      AND tc.table_name = 'tips'
      AND ccu.table_name = 'users';
    `);

    if (constraints.length > 0) {
      console.log('✅ Tips table foreign key constraint created');
      constraints.forEach((constraint: any) => {
        console.log(`  ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name} (${constraint.delete_rule})`);
      });
    } else {
      console.log('❌ Tips table foreign key constraint not found');
    }

    console.log('✅ Tips user_id migration completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

migrateAddTipsUserId().catch(console.error);
