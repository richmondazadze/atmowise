import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const resources = await storage.getResources(type || undefined)
    return NextResponse.json(resources)
  } catch (error: any) {
    console.error('Resources API error:', error)
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}
