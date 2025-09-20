import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'
import { insertSavedPlaceSchema } from '@/shared/schema'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const savedPlaces = await storage.getSavedPlaces(userId)
    return NextResponse.json(savedPlaces)
  } catch (error: any) {
    console.error('Get saved places error:', error)
    return NextResponse.json({ error: 'Failed to fetch saved places' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const savedPlaceData = insertSavedPlaceSchema.parse(body)
    const savedPlace = await storage.createSavedPlace(savedPlaceData)
    return NextResponse.json(savedPlace)
  } catch (error: any) {
    console.error('Create saved place error:', error)
    return NextResponse.json({ 
      error: 'Invalid saved place data', 
      details: error.message 
    }, { status: 400 })
  }
}
