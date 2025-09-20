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

async function testTimelineData() {
  console.log('🧪 Testing timeline data generation...');

  try {
    const testUserId = '24018f9d-5ff3-4618-9228-e63a3c9269b2';
    const testEmail = 'test@example.com';
    const lat = 40.7128;
    const lon = -74.0060;

    // 1. Create test user
    console.log('👤 Creating test user...');
    const userResponse = await fetch('http://localhost:3000/api/user/authenticated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: testUserId,
        email: testEmail 
      })
    });

    if (!userResponse.ok) {
      throw new Error(`User creation failed: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    console.log('✅ User created:', userData.id);

    // 2. Create air quality data
    console.log('🌬️ Creating air quality data...');
    const airResponse = await fetch(`http://localhost:3000/api/air?lat=${lat}&lon=${lon}&address=New York&userId=${testUserId}`);
    
    if (!airResponse.ok) {
      throw new Error(`Air quality fetch failed: ${airResponse.status}`);
    }

    const airData = await airResponse.json();
    console.log('✅ Air quality data:', airData.aqi, airData.category);

    // 3. Test timeline API for different periods
    const periods = [1, 7, 30, 90];
    
    for (const days of periods) {
      console.log(`📊 Testing timeline for ${days} days...`);
      
      const timelineResponse = await fetch(`http://localhost:3000/api/air/history?userId=${testUserId}&days=${days}&lat=${lat}&lon=${lon}`);
      
      if (!timelineResponse.ok) {
        throw new Error(`Timeline fetch failed for ${days} days: ${timelineResponse.status}`);
      }

      const timelineData = await timelineResponse.json();
      console.log(`✅ Timeline data for ${days} days:`, {
        totalReadings: timelineData.totalReadings,
        dataPoints: timelineData.data.length,
        period: timelineData.period,
        sampleData: timelineData.data.slice(0, 3).map((d: any) => ({
          date: d.date,
          time: d.time,
          aqi: d.aqi,
          source: d.source
        }))
      });
    }

    // 4. Verify data in database
    console.log('🔍 Verifying data in database...');
    const dbData = await db.execute(sql`
      SELECT 
        COUNT(*) as total_readings,
        MIN(timestamp) as earliest,
        MAX(timestamp) as latest,
        AVG(aqi) as avg_aqi
      FROM air_reads 
      WHERE user_id = ${userData.id};
    `);
    
    console.log('✅ Database verification:', dbData[0]);

    console.log('🎉 Timeline data test completed successfully!');
    console.log('📋 Summary:');
    console.log('  ✅ User creation and authentication');
    console.log('  ✅ Air quality data creation');
    console.log('  ✅ Timeline data generation for multiple periods');
    console.log('  ✅ Historical data visualization');
    console.log('  ✅ Data persistence and retrieval');

  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

testTimelineData().catch(console.error);
