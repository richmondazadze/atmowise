import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    // Get historical air quality data for the specified period
    const historicalData = await storage.getAirReadsForTimeline(userId, lat, lon, days);
    
    // Transform data for timeline display
    const timelineData = historicalData.map((reading, index) => ({
      id: reading.id,
      date: reading.timestamp.toISOString().split('T')[0],
      time: reading.timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      aqi: reading.aqi || 0,
      pm25: reading.pm25 || 0,
      pm10: reading.pm10 || 0,
      o3: reading.o3 || 0,
      no2: reading.no2 || 0,
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
