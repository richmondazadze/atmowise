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
    
    // Check if userId is a Supabase user ID (UUID format)
    let internalUserId = userId;
    if (isValidUUID(userId)) {
      // Try to find user by supabaseId first
      const user = await storage.getUserBySupabaseId(userId);
      if (user) {
        internalUserId = user.id;
      }
    }
    
    let profile = await storage.getProfile(internalUserId)
    
    // If profile doesn't exist, create a default one
    if (!profile) {
      console.log('Profile not found, creating default profile for user:', internalUserId);
      
      // Ensure user exists first
      if (isValidUUID(userId)) {
        const user = await storage.getUserBySupabaseId(userId);
        if (!user) {
          // Create user if they don't exist
          await storage.createUser({ supabaseId: userId });
        }
      }
      
      // Create default profile
      const defaultProfile = {
        userId: internalUserId,
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
    
    // Check if userId is a Supabase user ID (UUID format)
    let internalUserId = userId;
    if (isValidUUID(userId)) {
      // Try to find user by supabaseId first
      const user = await storage.getUserBySupabaseId(userId);
      if (user) {
        internalUserId = user.id;
      }
    }
    
    // Validate and sanitize the updates
    const updateData = insertProfileSchema.partial().parse(body)
    
    // First try to update existing profile
    let profile = await storage.updateProfile(internalUserId, updateData)
    
    // If profile doesn't exist, create it
    if (!profile) {
      console.log('Profile not found, creating new profile for user:', internalUserId);
      
      // Ensure user exists first
      if (isValidUUID(userId)) {
        const user = await storage.getUserBySupabaseId(userId);
        if (!user) {
          // Create user if they don't exist
          await storage.createUser({ supabaseId: userId });
        }
      }
      
      // Create new profile with the provided data
      const createData = {
        userId: internalUserId,
        ...updateData
      };
      profile = await storage.createProfile(createData);
      console.log('Created new profile:', profile.id);
    }
    
    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
