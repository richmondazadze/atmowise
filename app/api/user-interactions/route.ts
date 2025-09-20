import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/database';
import { insertUserInteractionSchema } from '@/shared/schema';

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle user ID mapping
    if (body.userId && isValidUUID(body.userId)) {
      const user = await storage.getUserBySupabaseId(body.userId);
      if (user) {
        body.userId = user.id;
      }
    }
    
    const interactionData = insertUserInteractionSchema.parse(body);
    const interaction = await storage.createUserInteraction(interactionData);
    return NextResponse.json(interaction);
  } catch (error: any) {
    console.error('Create user interaction error:', error);
    return NextResponse.json({ 
      error: "Invalid interaction data", 
      details: error.message 
    }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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

    const interactions = await storage.getUserInteractions(internalUserId, type || undefined, limit);
    return NextResponse.json(interactions);
  } catch (error: any) {
    console.error('Get user interactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch user interactions' }, { status: 500 });
  }
}
