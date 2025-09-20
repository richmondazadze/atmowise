import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, note, severity, linkedAirId } = await request.json()

    if (!note || !severity) {
      return NextResponse.json({ error: 'Note and severity are required' }, { status: 400 })
    }

    // Handle user ID - create user if needed or use null for anonymous
    let actualUserId = null;
    if (userId) {
      if (isValidUUID(userId)) {
        // Check if user exists by anonId (Supabase ID)
        let user = await storage.getUserByAnonId(userId);
        if (!user) {
          // Create user with Supabase ID as anonId
          user = await storage.createUser({ anonId: userId });
        }
        actualUserId = user.id;
      } else {
        // Create demo user for non-UUID IDs
        const demoUser = await storage.createUser({ anonId: userId });
        actualUserId = demoUser.id;
      }
    }

    const symptomData = {
      userId: actualUserId,
      timestamp: new Date(),
      note: note.trim(),
      severity: parseInt(severity),
      linkedAirId: linkedAirId || null,
      label: 'General', // Default label
      aiSummary: null,
      aiAction: null,
      aiSeverity: null
    }

    const savedSymptom = await storage.createSymptom(symptomData)
    
    return NextResponse.json(savedSymptom)
  } catch (error: any) {
    console.error('Symptom creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create symptom', 
      details: error.message 
    }, { status: 500 })
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const symptoms = await storage.getSymptomsByUser(userId, limit)
    
    return NextResponse.json(symptoms)
  } catch (error: any) {
    console.error('Symptoms fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch symptoms' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { symptomId, aiSummary, aiAction, aiSeverity } = await request.json()

    if (!symptomId) {
      return NextResponse.json({ error: 'Symptom ID is required' }, { status: 400 })
    }

    const updatedSymptom = await storage.updateSymptomAI(symptomId, {
      aiSummary,
      aiAction,
      aiSeverity
    })
    
    return NextResponse.json(updatedSymptom)
  } catch (error: any) {
    console.error('Symptom update error:', error)
    return NextResponse.json({ error: 'Failed to update symptom' }, { status: 500 })
  }
}
