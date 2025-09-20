import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const stats = await storage.getUserInteractionStats(userId);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Get user interaction stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch user interaction stats' }, { status: 500 });
  }
}
