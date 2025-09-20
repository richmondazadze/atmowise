import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/database';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, record } = body;

    // Verify this is a user deletion event
    if (type !== 'DELETE' || !record?.id) {
      return NextResponse.json({ message: 'Not a user deletion event' }, { status: 200 });
    }

    const supabaseUserId = record.id;
    console.log('🗑️ User deleted from Supabase:', supabaseUserId);

    // Find the user in our internal database
    const user = await storage.getUserBySupabaseId(supabaseUserId);
    
    if (!user) {
      console.log('ℹ️ User not found in internal database:', supabaseUserId);
      return NextResponse.json({ message: 'User not found in internal database' }, { status: 200 });
    }

    // Delete the user from our internal database
    // This will cascade delete all related data due to foreign key constraints
    await storage.deleteUser(user.id);
    
    console.log('✅ User and all related data deleted from internal database:', user.id);

    return NextResponse.json({ 
      message: 'User and all related data deleted successfully',
      deletedUserId: user.id 
    });

  } catch (error: any) {
    console.error('💥 Webhook error:', error);
    return NextResponse.json({ 
      error: 'Failed to process user deletion',
      details: error.message 
    }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Supabase user deletion webhook is active',
    timestamp: new Date().toISOString()
  });
}
