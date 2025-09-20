import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const geocodeApiKey = process.env.GEOCODE_API_KEY
    
    // Use Nominatim for suggestions (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&extratags=1`
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AtmoWise/1.0'
      }
    })
    
    if (!res.ok) {
      throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`)
    }
    
    const data = await res.json()
    
    const suggestions = data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      label: item.display_name,
      formatted: formatLocationName(item),
      type: item.type,
      importance: item.importance
    })).sort((a: any, b: any) => b.importance - a.importance)
    
    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error('Location suggestions API error:', error)
    return NextResponse.json({ 
      error: 'Failed to get location suggestions',
      message: error.message 
    }, { status: 500 })
  }
}

function formatLocationName(item: any): string {
  const parts = []
  
  // Add city/town name
  if (item.address?.city) {
    parts.push(item.address.city)
  } else if (item.address?.town) {
    parts.push(item.address.town)
  } else if (item.address?.village) {
    parts.push(item.address.village)
  } else if (item.address?.hamlet) {
    parts.push(item.address.hamlet)
  }
  
  // Add state/region
  if (item.address?.state) {
    parts.push(item.address.state)
  } else if (item.address?.region) {
    parts.push(item.address.region)
  } else if (item.address?.county) {
    parts.push(item.address.county)
  }
  
  // Add country
  if (item.address?.country) {
    parts.push(item.address.country)
  }
  
  // If we have a good formatted name, use it
  if (parts.length >= 2) {
    return parts.join(', ')
  }
  
  // Fallback to display_name but clean it up
  const displayName = item.display_name || ''
  // Remove extra details and keep it simple
  return displayName.split(',')[0] + (displayName.includes(',') ? ', ' + displayName.split(',')[1] : '')
}
