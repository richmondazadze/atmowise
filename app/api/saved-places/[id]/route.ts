import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // For now, we'll implement a simple delete by ID
    // In a real app, you'd want to verify the user owns this place
    const result = await storage.deleteSavedPlace(id)
    
    if (!result) {
      return NextResponse.json({ error: 'Saved place not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete saved place error:', error)
    return NextResponse.json({ error: 'Failed to delete saved place' }, { status: 500 })
  }
}
