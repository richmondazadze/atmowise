import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'
import { insertProfileSchema } from '@/shared/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Ensure user exists first and get internal user ID
    if (body.userId) {
      let user = await storage.getUserBySupabaseId(body.userId);
      if (!user) {
        // Create user if they don't exist
        user = await storage.createUser({ supabaseId: body.userId });
        console.log('Created user for profile:', user.id);
      }
      // Update the userId to use the internal user ID
      body.userId = user.id;
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
