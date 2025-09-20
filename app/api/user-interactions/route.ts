import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/database';
import { insertUserInteractionSchema } from '@/shared/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const interactions = await storage.getUserInteractions(userId, type || undefined, limit);
    return NextResponse.json(interactions);
  } catch (error: any) {
    console.error('Get user interactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch user interactions' }, { status: 500 });
  }
}
