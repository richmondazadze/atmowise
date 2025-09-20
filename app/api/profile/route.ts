import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'
import { insertProfileSchema } from '@/shared/schema'

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate userId format
    if (!body.userId || !isValidUUID(body.userId)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
    }
    
    const profileData = insertProfileSchema.parse(body)
    const profile = await storage.createProfile(profileData)
    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("Create profile error:", error)
    return NextResponse.json({ 
      error: "Invalid profile data", 
      details: error.message 
    }, { status: 400 })
  }
}