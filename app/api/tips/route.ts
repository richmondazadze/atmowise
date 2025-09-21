import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/database';
import { insertTipSchema } from '@/shared/schema';

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate userId if provided
    if (userId && !isValidUUID(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const tagParam = tag !== null ? tag : undefined;
    const userIdParam = userId || undefined;
    const tips = await storage.getTips(tagParam, userIdParam);
    return NextResponse.json(tips);
  } catch (error: any) {
    console.error('Get tips error:', error);
    return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate userId if provided
    if (body.userId && !isValidUUID(body.userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    const tipData = insertTipSchema.parse(body);
    const tip = await storage.createTip(tipData);
    return NextResponse.json(tip);
  } catch (error: any) {
    console.error('Create tip error:', error);
    return NextResponse.json({ 
      error: 'Invalid tip data', 
      details: error.message 
    }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipId, content, tag } = body;

    if (!tipId) {
      return NextResponse.json({ error: 'Tip ID is required' }, { status: 400 });
    }

    const updatedTip = await storage.updateTip(tipId, { content, tag });
    
    if (!updatedTip) {
      return NextResponse.json({ error: 'Tip not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedTip);
  } catch (error: any) {
    console.error('Update tip error:', error);
    return NextResponse.json({ error: 'Failed to update tip' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipId = searchParams.get('tipId');

    if (!tipId) {
      return NextResponse.json({ error: 'Tip ID is required' }, { status: 400 });
    }

    await storage.deleteTip(tipId);
    return NextResponse.json({ message: 'Tip deleted successfully' });
  } catch (error: any) {
    console.error('Delete tip error:', error);
    return NextResponse.json({ error: 'Failed to delete tip' }, { status: 500 });
  }
}