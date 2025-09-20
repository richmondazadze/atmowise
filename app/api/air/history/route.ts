import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../lib/database';

// Helper function to get AQI category
function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// Helper function to get dominant pollutant
function getDominantPollutant(components: any): string {
  const pollutants = {
    pm2_5: components.pm2_5 || 0,
    pm10: components.pm10 || 0,
    o3: components.o3 || 0,
    no2: components.no2 || 0,
    so2: components.so2 || 0,
    co: components.co || 0
  };
  
  const dominant = Object.entries(pollutants).reduce((a, b) => 
    pollutants[a[0] as keyof typeof pollutants] > pollutants[b[0] as keyof typeof pollutants] ? a : b
  );
  
  return dominant[0].toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supabaseUserId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');

    if (!supabaseUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    // First, get the internal user ID from the Supabase user ID
    const user = await storage.getUserBySupabaseId(supabaseUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get historical air quality data for the specified period
    let historicalData = await storage.getAirReadsForTimeline(user.id, lat, lon, days);
    
    // If no historical data exists or only 1 reading, try to fetch real historical data first
    if (historicalData.length <= 1) {
      console.log('Insufficient historical data found, attempting to fetch real historical data');
      
      // Try to fetch real historical data from OpenWeather (if available)
      try {
        const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
        if (openWeatherApiKey) {
          // Calculate start date for historical data
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
          const startTimestamp = Math.floor(startDate.getTime() / 1000);
          
          // Fetch historical data from OpenWeather (this is a paid feature)
          const historicalUrl = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${startTimestamp}&end=${Math.floor(Date.now() / 1000)}&appid=${openWeatherApiKey}`;
          
          const historicalResponse = await fetch(historicalUrl);
          if (historicalResponse.ok) {
            const historicalApiData = await historicalResponse.json();
            
            if (historicalApiData.list && historicalApiData.list.length > 0) {
              console.log(`Found ${historicalApiData.list.length} real historical data points from OpenWeather`);
              
              // Convert API data to our format
              historicalApiData.list.forEach((item: any, index: number) => {
                const reading = {
                  id: `historical-${index}`,
                  userId: user.id,
                  lat: lat,
                  lon: lon,
                  source: 'openweather-historical',
                  timestamp: new Date(item.dt * 1000),
                  pm25: item.components.pm2_5 || 0,
                  pm10: item.components.pm10 || 0,
                  o3: item.components.o3 || 0,
                  no2: item.components.no2 || 0,
                  aqi: item.main.aqi || 0,
                  category: getAQICategory(item.main.aqi),
                  dominantPollutant: getDominantPollutant(item.components),
                  createdAt: new Date(item.dt * 1000)
                };
                historicalData.push(reading);
              });
              
              // Sort by timestamp
              historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            }
          }
        }
      } catch (error) {
        console.log('Historical API fetch failed, falling back to generated data:', error.message);
      }
      
      // If still no data, generate realistic data based on current readings
      if (historicalData.length <= 1) {
        console.log('Generating realistic sample data for timeline');
        
        // Get current air quality data
        const currentAirData = historicalData.length > 0 ? historicalData[0] : await storage.getRecentAirRead(user.id, lat, lon, 60);
        
        if (currentAirData) {
          // Generate historical data points based on current data
          const now = new Date();
          const dataPoints = Math.min(days * 6, 50); // 6 readings per day, max 50 points
          
          for (let i = 0; i < dataPoints; i++) {
            const hoursAgo = (i * 24) / dataPoints; // Spread over the period
            const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
            
            // Add some realistic variation to the data
            const variation = 0.9 + (i % 3) * 0.1; // 0.9, 1.0, 1.1 pattern
            const timeVariation = Math.sin((i / dataPoints) * Math.PI * 2) * 0.1; // Daily pattern
            
            const generatedReading = {
              id: `generated-${i}`,
              userId: user.id,
              lat: lat,
              lon: lon,
              source: 'generated',
              timestamp: timestamp,
              pm25: Math.max(0, (currentAirData.pm25 || 0) * variation + timeVariation),
              pm10: Math.max(0, (currentAirData.pm10 || 0) * variation + timeVariation),
              o3: Math.max(0, (currentAirData.o3 || 0) * variation + timeVariation),
              no2: Math.max(0, (currentAirData.no2 || 0) * variation + timeVariation),
              aqi: Math.max(0, (currentAirData.aqi || 0) * variation + timeVariation),
              category: currentAirData.category || 'Good',
              dominantPollutant: currentAirData.dominantPollutant || 'PM2.5',
              createdAt: timestamp
            };
            
            historicalData.push(generatedReading);
          }
          
          // Sort by timestamp
          historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
      }
    }
    
    // Transform data for timeline display
    const timelineData = historicalData.map((reading, index) => ({
      id: reading.id,
      date: reading.timestamp.toISOString().split('T')[0],
      time: reading.timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      aqi: Math.round(reading.aqi || 0),
      pm25: Math.round((reading.pm25 || 0) * 10) / 10,
      pm10: Math.round((reading.pm10 || 0) * 10) / 10,
      o3: Math.round((reading.o3 || 0) * 10) / 10,
      no2: Math.round((reading.no2 || 0) * 10) / 10,
      category: reading.category || 'Unknown',
      location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      source: reading.source,
      createdAt: reading.createdAt
    }));

    // Sort by date (newest first)
    timelineData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      data: timelineData,
      period: days,
      totalReadings: timelineData.length,
      location: { lat, lon }
    });

  } catch (error: any) {
    console.error('Historical air data API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch historical data',
      details: error.message 
    }, { status: 500 });
  }
}
