import { NextRequest, NextResponse } from 'next/server'

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
    const { note, pm25, aqi, sensitivity } = await request.json();

    if (!note || typeof note !== 'string') {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 });
    }

    // Check for emergency keywords immediately
    if (EMERGENCY_REGEX.test(note)) {
      return NextResponse.json({
        summary: "This may be an emergency situation.",
        action: "Seek immediate medical attention or call emergency services (911).",
        severity: "high",
        emergency: true
      });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      console.warn('OpenRouter API key not configured, using fallback');
      const fallback = getFallbackResponse(note, 2, aqi);
      return NextResponse.json(fallback);
    }

    const systemPrompt = `You are a concise, empathetic, safety-first health assistant. NEVER give medical diagnoses. If the input text indicates an emergency (e.g., 'can't breathe', 'chest pain'), respond with severity:'high' and an instruction to seek immediate medical attention. Return only valid JSON with keys: summary, action, severity. Keep responses brief (max 2 sentences each).`;

    const userPrompt = `note="${note}", pm25=${pm25 || 'unknown'}, aqi=${aqi || 'unknown'}, sensitivity=${JSON.stringify(sensitivity || {})}`;

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
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.warn('OpenRouter API failed:', response.status, response.statusText);
      const fallback = getFallbackResponse(note, 2, aqi);
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const llmText = data.choices?.[0]?.message?.content || '';

    if (!llmText) {
      console.warn('Empty LLM response, using fallback');
      const fallback = getFallbackResponse(note, 2, aqi);
      return NextResponse.json(fallback);
    }

    // Parse LLM response safely
    const parsed = safeParseLLMResponse(llmText);

    // Validate required fields
    if (!parsed.summary || !parsed.action || !parsed.severity) {
      console.warn('Invalid LLM response structure, using fallback');
      const fallback = getFallbackResponse(note, 2, aqi);
      return NextResponse.json(fallback);
    }

    // Safety check: override severity if emergency keywords detected
    if (EMERGENCY_REGEX.test(note) && parsed.severity !== 'high') {
      parsed.severity = 'high';
      parsed.action = 'Seek immediate medical attention or call emergency services (911).';
      parsed.emergency = true;
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('LLM reflection error:', error);
    
    // Use fallback response on any error
    const fallback = getFallbackResponse('', 2, null);
    return NextResponse.json(fallback);
  }
}