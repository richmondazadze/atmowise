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
    
    // Validate userId format
    if (!body.userId || !isValidUUID(body.userId)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
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

    // Validate userId format
    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const interactions = await storage.getUserInteractions(userId, type || undefined, limit);
    return NextResponse.json(interactions);
  } catch (error: any) {
    console.error('Get user interactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch user interactions' }, { status: 500 });
  }
}
