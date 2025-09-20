import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { anonId } = body

    if (!anonId) {
      return NextResponse.json({ error: 'Anonymous ID is required' }, { status: 400 })
    }

    // Check if user already exists
    let user = await storage.getUserByAnonId(anonId)
    
    if (!user) {
      // Create new user
      user = await storage.createUser({ anonId })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Create anonymous user error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
