import { NextRequest, NextResponse } from 'next/server'
import { getAirQualityForAddress } from '../../../../lib/airQualityMultiSource'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('q')

    if (!address) {
      return NextResponse.json({ error: 'Address query parameter is required' }, { status: 400 })
    }

    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY
    const airNowApiKey = process.env.NEXT_PUBLIC_AIRNOW_KEY
    const geocodeApiKey = process.env.GEOCODE_API_KEY
    
    if (!openWeatherApiKey || openWeatherApiKey === 'your_openweather_key') {
      return NextResponse.json({ 
        error: 'OpenWeather API key not configured',
        message: 'Please configure OPENWEATHER_API_KEY in your environment variables'
      }, { status: 500 })
    }

    if (!geocodeApiKey) {
      return NextResponse.json({ 
        error: 'Geocoding API key not configured',
        message: 'Please configure GEOCODE_API_KEY in your environment variables'
      }, { status: 500 })
    }

    const result = await getAirQualityForAddress(address, openWeatherApiKey, airNowApiKey, geocodeApiKey)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Location search API error:', error)
    return NextResponse.json({ 
      error: 'Failed to search location',
      message: error.message 
    }, { status: 500 })
  }
}
