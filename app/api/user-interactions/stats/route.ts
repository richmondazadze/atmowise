import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/database';

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate userId format
    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const stats = await storage.getUserInteractionStats(userId);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Get user interaction stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch user interaction stats' }, { status: 500 });
  }
}
