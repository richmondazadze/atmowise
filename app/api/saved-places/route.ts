import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'
import { insertSavedPlaceSchema } from '@/shared/schema'

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate userId format
    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
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
    
    // Validate userId format
    if (!body.userId || !isValidUUID(body.userId)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
    }
    
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
