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

    // Check if userId is a Supabase user ID (UUID format)
    let internalUserId = userId;
    if (isValidUUID(userId)) {
      // Try to find user by supabaseId first
      const user = await storage.getUserBySupabaseId(userId);
      if (user) {
        internalUserId = user.id;
      }
    }

    const savedPlaces = await storage.getSavedPlaces(internalUserId)
    return NextResponse.json(savedPlaces)
  } catch (error: any) {
    console.error('Get saved places error:', error)
    return NextResponse.json({ error: 'Failed to fetch saved places' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle user ID mapping
    if (body.userId && isValidUUID(body.userId)) {
      const user = await storage.getUserBySupabaseId(body.userId);
      if (user) {
        body.userId = user.id;
      }
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
