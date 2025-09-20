import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/database'

// Emergency keywords for safety override
const EMERGENCY_REGEX = /(can't breathe|cannot breathe|chest pain|chest tight|faint|fainting|passing out|pass out|severe shortness|call 911|call emergency|difficulty breathing|choking)/i;

// Canned fallback responses based on severity and AQI
const FALLBACK_RESPONSES = {
  low: {
    summary: "Mild symptoms noted. It's good that you're tracking how you feel.",
    action: "Continue monitoring. Stay hydrated and rest as needed.",
    severity: "low"
  },
  moderate: {
    summary: "You're experiencing some discomfort that may be related to air quality.",
    action: "Consider limiting outdoor activities and using air purification if available.",
    severity: "moderate"
  },
  high: {
    summary: "Your symptoms sound concerning and may need immediate attention.",
    action: "Seek immediate medical attention or call emergency services.",
    severity: "high"
  }
};

function safeParseLLMResponse(text: string): any {
  try {
    // Try to parse as JSON first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through to fallback
      }
    }
    
    // Return fallback structure
    return {
      summary: "I've noted your symptoms. Please monitor how you feel.",
      action: "Consider consulting with a healthcare provider if symptoms persist.",
      severity: "moderate"
    };
  }
}

function getFallbackResponse(note: string, severity: number, aqi: number | null): any {
  // Check for emergency keywords first
  if (EMERGENCY_REGEX.test(note)) {
    return {
      summary: "This may be an emergency situation.",
      action: "Seek immediate medical attention or call emergency services (911).",
      severity: "high"
    };
  }

  // Determine severity based on input
  if (severity >= 4 || (aqi && aqi > 200)) {
    return FALLBACK_RESPONSES.high;
  } else if (severity >= 2 || (aqi && aqi > 100)) {
    return FALLBACK_RESPONSES.moderate;
  } else {
    return FALLBACK_RESPONSES.low;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      note, 
      pm25, 
      pm10, 
      o3, 
      no2, 
      aqi, 
      category, 
      dominantPollutant,
      sensitivity, 
      userId,
      location,
      timestamp 
    } = await request.json();

    if (!note || typeof note !== 'string') {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 });
    }

    // Check for emergency keywords immediately
    if (EMERGENCY_REGEX.test(note)) {
      return NextResponse.json({
        summary: "This may be an emergency situation.",
        action: "Seek immediate medical attention or call emergency services (911).",
        severity: "high",
        emergency: true,
        tips: []
      });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      console.warn('OpenRouter API key not configured, using fallback');
      const fallback = getFallbackResponse(note, 2, aqi);
      return NextResponse.json({ ...fallback, tips: [] });
    }

    // Enhanced system prompt for comprehensive analysis and tips
    const systemPrompt = `You are an expert health and air quality assistant. Analyze the user's symptoms, air quality data, and health profile to provide:

1. A brief summary of their condition
2. Immediate action recommendations
3. Severity assessment (low/moderate/high)
4. 3-5 personalized health tips based on their specific situation

Consider:
- Air quality levels (PM2.5, PM10, O3, NO2, AQI)
- User's health sensitivities (asthma, COPD, etc.)
- Current symptoms and severity
- Location and environmental factors
- Time of day and seasonal considerations

Return ONLY valid JSON with this structure:
{
  "summary": "Brief 1-2 sentence summary",
  "action": "Immediate action recommendation",
  "severity": "low|moderate|high",
  "tips": [
    {
      "title": "Tip title",
      "content": "Detailed tip content",
      "category": "immediate|prevention|lifestyle|medical",
      "priority": 1-5
    }
  ]
}

Be specific, actionable, and consider the user's health profile.`;

    // Build comprehensive user prompt with all available data
    const airQualityData = {
      pm25: pm25 || 'unknown',
      pm10: pm10 || 'unknown', 
      o3: o3 || 'unknown',
      no2: no2 || 'unknown',
      aqi: aqi || 'unknown',
      category: category || 'unknown',
      dominantPollutant: dominantPollutant || 'unknown'
    };

    const userPrompt = `User reported: "${note}"
    
Air Quality Data: ${JSON.stringify(airQualityData)}
User Health Profile: ${JSON.stringify(sensitivity || {})}
Location: ${location || 'unknown'}
Time: ${timestamp || new Date().toISOString()}

Please provide comprehensive health analysis and personalized tips.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://atmowise.com',
        'X-Title': 'AtmoWise Health Assistant'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.warn('OpenRouter API failed:', response.status, response.statusText);
      const fallback = getFallbackResponse(note, 2, aqi);
      return NextResponse.json({ ...fallback, tips: [] });
    }

    const data = await response.json();
    const llmText = data.choices?.[0]?.message?.content || '';

    if (!llmText) {
      console.warn('Empty LLM response, using fallback');
      const fallback = getFallbackResponse(note, 2, aqi);
      return NextResponse.json({ ...fallback, tips: [] });
    }

    // Parse LLM response safely
    const parsed = safeParseLLMResponse(llmText);

    // Validate required fields
    if (!parsed.summary || !parsed.action || !parsed.severity) {
      console.warn('Invalid LLM response structure, using fallback');
      const fallback = getFallbackResponse(note, 2, aqi);
      return NextResponse.json({ ...fallback, tips: [] });
    }

    // Ensure tips array exists
    if (!parsed.tips || !Array.isArray(parsed.tips)) {
      parsed.tips = [];
    }

    // Safety check: override severity if emergency keywords detected
    if (EMERGENCY_REGEX.test(note) && parsed.severity !== 'high') {
      parsed.severity = 'high';
      parsed.action = 'Seek immediate medical attention or call emergency services (911).';
      parsed.emergency = true;
    }

    // Store tips in database if user ID provided
    if (userId && parsed.tips && parsed.tips.length > 0) {
      try {
        // Map Supabase user ID to internal user ID
        let internalUserId = userId;
        if (isValidUUID(userId)) {
          let user = await storage.getUserBySupabaseId(userId);
          if (!user) {
            // Create user if they don't exist
            user = await storage.createUser({ supabaseId: userId });
            console.log('Created user for tips storage:', user.id);
          }
          internalUserId = user.id;
        }

        // Store each tip
        for (const tip of parsed.tips) {
          await storage.createTip({
            tag: tip.category || 'general',
            content: `${tip.title}\n\n${tip.content}`,
            userId: internalUserId
          });
        }
        console.log(`Stored ${parsed.tips.length} tips for user ${internalUserId}`);
      } catch (error) {
        console.error('Failed to store tips:', error);
        // Continue without failing the main response
      }
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('LLM reflection error:', error);
    
    // Use fallback response on any error
    const fallback = getFallbackResponse('', 2, null);
    return NextResponse.json({ ...fallback, tips: [] });
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}