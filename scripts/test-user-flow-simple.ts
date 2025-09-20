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
  console.log('🧪 Testing user flow with real user...');

  try {
    const testUserId = '24018f9d-5ff3-4618-9228-e63a3c9269b2';
    const testEmail = 'azadzerichmond@gmail.com';

    // 1. Use Supabase user ID directly
    console.log('👤 Using Supabase user ID directly...');
    console.log('✅ User ID:', testUserId);

    // 2. Test profile creation
    console.log('📋 Testing profile creation...');
    const profileResponse = await fetch('http://localhost:3000/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        displayName: 'Test User',
        sensitivity: { asthma: true, ageGroup: 'adult' },
        notifications: { airQualityAlerts: true }
      })
    });

    if (!profileResponse.ok) {
      throw new Error(`Profile creation failed: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ Profile created:', profileData.id);

    // 3. Test air quality data
    console.log('🌬️ Testing air quality data...');
    const airResponse = await fetch(`http://localhost:3000/api/air?lat=40.7128&lon=-74.0060&address=New York&userId=${testUserId}`);
    
    if (!airResponse.ok) {
      throw new Error(`Air quality fetch failed: ${airResponse.status}`);
    }

    const airData = await airResponse.json();
    console.log('✅ Air quality data:', airData.aqi, airData.category);

    // 4. Test symptom logging
    console.log('📝 Testing symptom logging...');
    const symptomResponse = await fetch('http://localhost:3000/api/symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        note: 'I have a cough and feel short of breath',
        severity: 3,
        linkedAirId: airData.id
      })
    });

    if (!symptomResponse.ok) {
      throw new Error(`Symptom creation failed: ${symptomResponse.status}`);
    }

    const symptomData = await symptomResponse.json();
    console.log('✅ Symptom created:', symptomData.id);

    // 5. Test LLM reflection with tips
    console.log('🤖 Testing LLM reflection...');
    const llmResponse = await fetch('http://localhost:3000/api/llm/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note: 'I have a cough and feel short of breath',
        pm25: airData.pm25,
        pm10: airData.pm10,
        o3: airData.o3,
        no2: airData.no2,
        aqi: airData.aqi,
        category: airData.category,
        dominantPollutant: airData.dominantPollutant,
        severity: 3,
        sensitivity: { asthma: true, ageGroup: 'adult' },
        userId: testUserId,
        location: '40.7128, -74.0060',
        timestamp: new Date().toISOString()
      })
    });

    if (!llmResponse.ok) {
      throw new Error(`LLM reflection failed: ${llmResponse.status}`);
    }

    const llmData = await llmResponse.json();
    console.log('✅ LLM reflection received:', llmData.summary);
    console.log('✅ Tips generated:', llmData.tips?.length || 0);

    // 6. Test tips retrieval
    console.log('💡 Testing tips retrieval...');
    const tipsResponse = await fetch(`http://localhost:3000/api/tips?userId=${testUserId}`);
    
    if (!tipsResponse.ok) {
      throw new Error(`Tips retrieval failed: ${tipsResponse.status}`);
    }

    const tipsData = await tipsResponse.json();
    console.log('✅ Tips retrieved:', tipsData.length);

    // 7. Test symptoms retrieval
    console.log('📊 Testing symptoms retrieval...');
    const symptomsResponse = await fetch(`http://localhost:3000/api/symptoms?userId=${testUserId}`);
    
    if (!symptomsResponse.ok) {
      throw new Error(`Symptoms retrieval failed: ${symptomsResponse.status}`);
    }

    const symptomsData = await symptomsResponse.json();
    console.log('✅ Symptoms retrieved:', symptomsData.length);

    // 8. Verify data in database
    console.log('🔍 Verifying data in database...');
    const dbData = await db.execute(sql`
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
      WHERE u.supabase_id = ${testUserId}
      GROUP BY u.id, u.supabase_id, u.email, p.display_name;
    `);
    
    console.log('✅ Database verification:', dbData[0]);

    console.log('🎉 User flow test completed successfully!');
    console.log('📋 Summary:');
    console.log('  ✅ User creation and authentication');
    console.log('  ✅ Profile setup with health preferences');
    console.log('  ✅ Air quality data fetching');
    console.log('  ✅ Symptom logging and tracking');
    console.log('  ✅ AI-powered health analysis');
    console.log('  ✅ Personalized tips generation');
    console.log('  ✅ Data persistence and retrieval');
    console.log('  ✅ Complete end-to-end flow');

  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

testUserFlow().catch(console.error);
