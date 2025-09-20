import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 });
    }

    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!openWeatherApiKey) {
      // Return a fallback response if no API key
      return NextResponse.json([{
        name: 'Current Location',
        state: '',
        country: 'Unknown',
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      }]);
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${openWeatherApiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Return a fallback response
    return NextResponse.json([{
      name: 'Current Location',
      state: '',
      country: 'Unknown',
      lat: parseFloat(searchParams.get('lat') || '0'),
      lon: parseFloat(searchParams.get('lon') || '0')
    }]);
  }
}
