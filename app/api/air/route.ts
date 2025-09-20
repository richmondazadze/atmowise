import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lon = parseFloat(searchParams.get('lon') || '0')
    const address = searchParams.get('address')
    const userId = searchParams.get('userId')

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // First, get the internal user ID from the Supabase user ID
    let internalUserId = userId;
    try {
      const user = await storage.getUserBySupabaseId(userId);
      if (user) {
        internalUserId = user.id;
      } else {
        // Create user if doesn't exist
        const newUser = await storage.createUser({ supabaseId: userId });
        internalUserId = newUser.id;
      }
    } catch (error) {
      console.warn('Failed to get/create user:', error);
      // Fallback to using the Supabase ID directly
    }

    // Check for recent data first (30 minutes cache)
    const recentData = await storage.getRecentAirRead(internalUserId, lat, lon, 30)
    if (recentData) {
      return NextResponse.json({ ...recentData, cached: true })
    }

    // Use OpenWeather API directly
    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY
    
    if (!openWeatherApiKey || openWeatherApiKey === 'your_openweather_key') {
      // Return demo data instead of error
      const demoData = {
        lat: lat,
        lon: lon,
        source: "demo",
        timestamp: new Date(),
        pm25: 25,
        pm10: 45,
        o3: 60,
        no2: 30,
        aqi: 75,
        category: 'Moderate',
        dominantPollutant: 'PM2.5',
        rawPayload: { demo: true },
        demo: true
      };
      
      // Save demo data to database with user ID
      const savedDemoData = await storage.createAirRead({
        ...demoData,
        userId: internalUserId
      });
      
      return NextResponse.json(savedDemoData);
    }

    // Fetch from OpenWeather API
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error("OpenWeather API failed")
    const openWeatherData = await res.json()
    
    // Process OpenWeather data
    const airData = openWeatherData.list?.[0]
    if (!airData) {
      throw new Error("No air quality data available")
    }

    // Convert OpenWeather AQI (1-5) to standard AQI (0-500)
    const aqiMapping: Record<number, number> = {
      1: 50,   // Good
      2: 100,  // Fair
      3: 150,  // Moderate
      4: 200,  // Poor
      5: 300   // Very Poor
    };

    const standardAQI = aqiMapping[airData.main.aqi] || 50;
    const category = standardAQI <= 50 ? 'Good' : 
                    standardAQI <= 100 ? 'Moderate' : 
                    standardAQI <= 150 ? 'Unhealthy for Sensitive Groups' : 
                    standardAQI <= 200 ? 'Unhealthy' : 
                    standardAQI <= 300 ? 'Very Unhealthy' : 'Hazardous';

    const processedData = {
      userId: internalUserId,
      lat: lat,
      lon: lon,
      source: "openweather",
      timestamp: new Date(),
      pm25: airData.components.pm2_5 || null,
      pm10: airData.components.pm10 || null,
      o3: airData.components.o3 || null,
      no2: airData.components.no2 || null,
      aqi: standardAQI,
      rawPayload: airData,
      category: category,
      dominantPollutant: 'PM2.5', // Simplified for now
    }

    // Save to database
    const savedData = await storage.createAirRead(processedData)
    
    return NextResponse.json(savedData)
  } catch (error: any) {
    console.error('Air quality API error:', error)
    
    // Get lat/lon from searchParams for error fallback
    const { searchParams } = new URL(request.url)
    const errorLat = parseFloat(searchParams.get('lat') || '40.7128')
    const errorLon = parseFloat(searchParams.get('lon') || '-74.0060')
    const errorUserId = searchParams.get('userId')
    
    // Return consistent demo data on any error instead of failing
    const demoData = {
      lat: errorLat,
      lon: errorLon,
      source: "demo",
      timestamp: new Date(),
      pm25: 25,
      pm10: 45,
      o3: 60,
      no2: 30,
      aqi: 75,
      category: 'Moderate',
      dominantPollutant: 'PM2.5',
      rawPayload: { demo: true, error: error.message },
      demo: true,
      error: true
    };
    
    // Save error demo data to database with user ID if available
    if (errorUserId) {
      // Try to get the internal user ID
      let internalErrorUserId = errorUserId;
      try {
        const user = await storage.getUserBySupabaseId(errorUserId);
        if (user) {
          internalErrorUserId = user.id;
        }
      } catch (error) {
        console.warn('Failed to get user for error fallback:', error);
      }
      
      const savedErrorData = await storage.createAirRead({
        ...demoData,
        userId: internalErrorUserId
      });
      return NextResponse.json(savedErrorData);
    }
    
    return NextResponse.json(demoData);
  }
}
