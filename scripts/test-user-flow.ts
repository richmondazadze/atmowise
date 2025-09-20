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

async function testUserFlow() {
  console.log('🧪 Testing user flow and data consistency...');

  try {
    // Test 1: Check if all tables exist and have proper foreign key constraints
    console.log('📊 Checking table structure...');
    
    const tables = await db.execute(sql`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'profiles', 'air_reads', 'symptoms', 'saved_places', 'user_interactions')
      ORDER BY table_name, ordinal_position;
    `);
    
    console.log('✅ Tables and columns found:', tables.length);
    
    // Test 2: Check foreign key constraints
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
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
        AND tc.table_schema = rc.constraint_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
      AND ccu.table_name = 'users'
      ORDER BY tc.table_name;
    `);
    
    console.log('✅ Foreign key constraints:');
    constraints.forEach((constraint: any) => {
      console.log(`  ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name} (${constraint.delete_rule})`);
    });
    
    // Test 3: Test user creation and data flow
    console.log('👤 Testing user creation and data flow...');
    
    const testSupabaseId = '550e8400-e29b-41d4-a716-446655440000';
    const testEmail = 'test@example.com';
    
    // Create a test user
    const userResult = await db.execute(sql`
      INSERT INTO users (supabase_id, email) 
      VALUES (${testSupabaseId}, ${testEmail})
      ON CONFLICT (supabase_id) DO UPDATE SET email = EXCLUDED.email
      RETURNING id, supabase_id, email;
    `);
    
    const userId = userResult[0].id;
    console.log('✅ Test user created:', { id: userId, supabaseId: testSupabaseId, email: testEmail });
    
    // Create test profile
    const profileResult = await db.execute(sql`
      INSERT INTO profiles (user_id, display_name, sensitivity, notifications)
      VALUES (${userId}, 'Test User', '{"asthma": true, "ageGroup": "adult"}', '{"airQualityAlerts": true}')
      RETURNING id, user_id;
    `);
    
    console.log('✅ Test profile created:', profileResult[0]);
    
    // Create test air read
    const airReadResult = await db.execute(sql`
      INSERT INTO air_reads (user_id, lat, lon, source, timestamp, pm25, pm10, o3, no2, aqi, dominant_pollutant)
      VALUES (${userId}, 40.7128, -74.0060, 'test', NOW(), 15.5, 25.3, 45.2, 12.1, 65, 'PM2.5')
      RETURNING id, user_id;
    `);
    
    console.log('✅ Test air read created:', airReadResult[0]);
    
    // Create test symptom
    const symptomResult = await db.execute(sql`
      INSERT INTO symptoms (user_id, timestamp, label, severity, note, linked_air_id)
      VALUES (${userId}, NOW(), 'Cough', 3, 'Mild cough after outdoor activity', ${airReadResult[0].id})
      RETURNING id, user_id;
    `);
    
    console.log('✅ Test symptom created:', symptomResult[0]);
    
    // Test 4: Verify data relationships
    console.log('🔍 Verifying data relationships...');
    
    const userData = await db.execute(sql`
      SELECT 
        u.id as user_id,
        u.supabase_id,
        u.email,
        p.display_name,
        COUNT(DISTINCT ar.id) as air_reads_count,
        COUNT(DISTINCT s.id) as symptoms_count
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN air_reads ar ON u.id = ar.user_id
      LEFT JOIN symptoms s ON u.id = s.user_id
      WHERE u.id = ${userId}
      GROUP BY u.id, u.supabase_id, u.email, p.display_name;
    `);
    
    console.log('✅ User data summary:', userData[0]);
    
    // Test 5: Test cascade deletion
    console.log('🗑️ Testing cascade deletion...');
    
    const beforeDelete = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM profiles WHERE user_id = ${userId}) as profiles_count,
        (SELECT COUNT(*) FROM air_reads WHERE user_id = ${userId}) as air_reads_count,
        (SELECT COUNT(*) FROM symptoms WHERE user_id = ${userId}) as symptoms_count;
    `);
    
    console.log('📊 Data before deletion:', beforeDelete[0]);
    
    // Delete user (should cascade)
    await db.execute(sql`DELETE FROM users WHERE id = ${userId};`);
    
    const afterDelete = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM profiles WHERE user_id = ${userId}) as profiles_count,
        (SELECT COUNT(*) FROM air_reads WHERE user_id = ${userId}) as air_reads_count,
        (SELECT COUNT(*) FROM symptoms WHERE user_id = ${userId}) as symptoms_count;
    `);
    
    console.log('📊 Data after deletion:', afterDelete[0]);
    
    if (afterDelete[0].profiles_count === '0' && 
        afterDelete[0].air_reads_count === '0' && 
        afterDelete[0].symptoms_count === '0') {
      console.log('✅ Cascade deletion working correctly!');
    } else {
      console.log('❌ Cascade deletion failed!');
    }
    
    console.log('🎉 User flow test completed successfully!');

  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

testUserFlow().catch(console.error);
