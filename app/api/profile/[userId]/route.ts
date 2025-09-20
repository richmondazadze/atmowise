import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'
import { insertProfileSchema } from '@/shared/schema'

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    // Validate userId format
    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    let profile = await storage.getProfile(userId)
    
    // If profile doesn't exist, create a default one
    if (!profile) {
      console.log('Profile not found, creating default profile for user:', userId);
      
      // Create default profile
      const defaultProfile = {
        userId: userId, // Use Supabase user ID directly
        displayName: null,
        sensitivity: {},
        notifications: {
          airQualityAlerts: true,
          healthTips: true,
          weeklyReports: false
        }
      };
      profile = await storage.createProfile(defaultProfile);
      console.log('Created default profile:', profile.id);
    }
    
    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const body = await request.json()
    
    // Validate userId format
    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    // Validate and sanitize the updates
    const updateData = insertProfileSchema.partial().parse(body)
    
    // First try to update existing profile
    let profile = await storage.updateProfile(userId, updateData)
    
    // If profile doesn't exist, create it
    if (!profile) {
      // Create new profile with the provided data
      const createData = {
        userId: userId, // Use Supabase user ID directly
        ...updateData
      };
      profile = await storage.createProfile(createData);
    }
    
    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}