import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user already exists by Supabase user ID
    let user = await storage.getUserBySupabaseId(userId)
    
    if (!user) {
      // Create new user with Supabase ID as the primary identifier
      user = await storage.createUser({ 
        supabaseId: userId,
        email: email || null
      })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Create authenticated user error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
