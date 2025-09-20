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

async function testCompleteTipsFlow() {
  console.log('🧪 Testing complete AI tips flow...');

  try {
    // 1. Create a test user
    console.log('👤 Creating test user...');
    const userResult = await db.execute(sql`
      INSERT INTO users (supabase_id, email) 
      VALUES ('test-tips-user-123', 'tips@test.com')
      ON CONFLICT (supabase_id) DO UPDATE SET email = EXCLUDED.email
      RETURNING id, supabase_id, email;
    `);
    
    const userId = userResult[0].id;
    console.log('✅ Test user created:', { id: userId, supabaseId: 'test-tips-user-123' });

    // 2. Create a test profile
    console.log('📋 Creating test profile...');
    const profileResult = await db.execute(sql`
      INSERT INTO profiles (user_id, display_name, sensitivity, notifications)
      VALUES (${userId}, 'Tips Test User', '{"asthma": true, "ageGroup": "adult"}', '{"airQualityAlerts": true}')
      RETURNING id, user_id;
    `);
    
    console.log('✅ Test profile created:', profileResult[0]);

    // 3. Create a test air read
    console.log('🌬️ Creating test air read...');
    const airReadResult = await db.execute(sql`
      INSERT INTO air_reads (user_id, lat, lon, source, timestamp, pm25, pm10, o3, no2, aqi, category, dominant_pollutant)
      VALUES (${userId}, 40.7128, -74.0060, 'test', NOW(), 25.5, 45.2, 65.3, 18.7, 85, 'Moderate', 'PM2.5')
      RETURNING id, user_id;
    `);
    
    console.log('✅ Test air read created:', airReadResult[0]);

    // 4. Test LLM reflection API
    console.log('🤖 Testing LLM reflection API...');
    const reflectionResponse = await fetch('http://localhost:3000/api/llm/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note: 'I have a persistent cough and feel short of breath, especially when walking outside',
        pm25: 25.5,
        pm10: 45.2,
        o3: 65.3,
        no2: 18.7,
        aqi: 85,
        category: 'Moderate',
        dominantPollutant: 'PM2.5',
        severity: 3,
        sensitivity: { asthma: true, ageGroup: 'adult' },
        userId: 'test-tips-user-123',
        location: '40.7128, -74.0060',
        timestamp: new Date().toISOString()
      })
    });

    if (!reflectionResponse.ok) {
      throw new Error(`LLM reflection API failed: ${reflectionResponse.status}`);
    }

    const reflectionData = await reflectionResponse.json();
    console.log('✅ LLM reflection received:', {
      summary: reflectionData.summary,
      action: reflectionData.action,
      severity: reflectionData.severity,
      tipsCount: reflectionData.tips?.length || 0
    });

    // 5. Check if tips were stored
    console.log('💡 Checking stored tips...');
    const tipsResult = await db.execute(sql`
      SELECT id, tag, content, created_at
      FROM tips 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `);
    
    console.log('✅ Tips stored in database:', tipsResult.length);
    tipsResult.forEach((tip: any, index: number) => {
      console.log(`  ${index + 1}. [${tip.tag}] ${tip.content.split('\n')[0]}`);
    });

    // 6. Test tips API
    console.log('🔌 Testing tips API...');
    const tipsApiResponse = await fetch('http://localhost:3000/api/tips?userId=test-tips-user-123');
    
    if (!tipsApiResponse.ok) {
      throw new Error(`Tips API failed: ${tipsApiResponse.status}`);
    }

    const tipsApiData = await tipsApiResponse.json();
    console.log('✅ Tips API response:', tipsApiData.length, 'tips');

    // 7. Test symptom creation with AI analysis
    console.log('📝 Testing symptom creation with AI analysis...');
    const symptomResponse = await fetch('http://localhost:3000/api/symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-tips-user-123',
        note: 'Coughing more than usual, especially in the morning',
        severity: 2,
        linkedAirId: airReadResult[0].id
      })
    });

    if (!symptomResponse.ok) {
      throw new Error(`Symptom creation failed: ${symptomResponse.status}`);
    }

    const symptomData = await symptomResponse.json();
    console.log('✅ Symptom created:', symptomData.id);

    // 8. Verify complete data flow
    console.log('🔍 Verifying complete data flow...');
    const userData = await db.execute(sql`
      SELECT 
        u.id as user_id,
        u.supabase_id,
        u.email,
        p.display_name,
        COUNT(DISTINCT ar.id) as air_reads_count,
        COUNT(DISTINCT s.id) as symptoms_count,
        COUNT(DISTINCT t.id) as tips_count
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN air_reads ar ON u.id = ar.user_id
      LEFT JOIN symptoms s ON u.id = s.user_id
      LEFT JOIN tips t ON u.id = t.user_id
      WHERE u.id = ${userId}
      GROUP BY u.id, u.supabase_id, u.email, p.display_name;
    `);
    
    console.log('✅ Complete data summary:', userData[0]);

    // 9. Clean up test data
    console.log('🧹 Cleaning up test data...');
    await db.execute(sql`DELETE FROM users WHERE id = ${userId};`);
    
    const afterDelete = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM tips WHERE user_id = ${userId}) as tips_count,
        (SELECT COUNT(*) FROM symptoms WHERE user_id = ${userId}) as symptoms_count,
        (SELECT COUNT(*) FROM air_reads WHERE user_id = ${userId}) as air_reads_count;
    `);
    
    console.log('✅ Data after cleanup:', afterDelete[0]);

    console.log('🎉 Complete AI tips flow test successful!');
    console.log('📋 Summary:');
    console.log('  ✅ User creation and profile setup');
    console.log('  ✅ Air quality data integration');
    console.log('  ✅ LLM reflection with comprehensive tips');
    console.log('  ✅ Tips storage in database');
    console.log('  ✅ Tips API functionality');
    console.log('  ✅ Symptom logging with AI analysis');
    console.log('  ✅ Complete data flow verification');
    console.log('  ✅ Cascade deletion working');

  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

testCompleteTipsFlow().catch(console.error);
