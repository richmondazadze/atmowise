import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
    hasOpenAQ: !!process.env.OPENAQ_API_KEY,
    hasOpenWeather: !!process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== "your_openweather_api_key_here",
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
  })
}
