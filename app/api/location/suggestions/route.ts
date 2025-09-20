import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Popular locations for quick access
    const popularLocations = [
      {
        lat: 40.7128,
        lon: -74.006,
        label: "New York City, NY, USA",
        formatted: "New York City, NY",
        type: "city",
        importance: 1.0,
      },
      {
        lat: 34.0522,
        lon: -118.2437,
        label: "Los Angeles, CA, USA",
        formatted: "Los Angeles, CA",
        type: "city",
        importance: 0.95,
      },
      {
        lat: 41.8781,
        lon: -87.6298,
        label: "Chicago, IL, USA",
        formatted: "Chicago, IL",
        type: "city",
        importance: 0.9,
      },
      {
        lat: 29.7604,
        lon: -95.3698,
        label: "Houston, TX, USA",
        formatted: "Houston, TX",
        type: "city",
        importance: 0.85,
      },
      {
        lat: 33.4484,
        lon: -112.074,
        label: "Phoenix, AZ, USA",
        formatted: "Phoenix, AZ",
        type: "city",
        importance: 0.8,
      },
      {
        lat: 39.9526,
        lon: -75.1652,
        label: "Philadelphia, PA, USA",
        formatted: "Philadelphia, PA",
        type: "city",
        importance: 0.75,
      },
      {
        lat: 32.7767,
        lon: -96.797,
        label: "Dallas, TX, USA",
        formatted: "Dallas, TX",
        type: "city",
        importance: 0.7,
      },
      {
        lat: 25.7617,
        lon: -80.1918,
        label: "Miami, FL, USA",
        formatted: "Miami, FL",
        type: "city",
        importance: 0.65,
      },
      {
        lat: 47.6062,
        lon: -122.3321,
        label: "Seattle, WA, USA",
        formatted: "Seattle, WA",
        type: "city",
        importance: 0.6,
      },
      {
        lat: 39.7392,
        lon: -104.9903,
        label: "Denver, CO, USA",
        formatted: "Denver, CO",
        type: "city",
        importance: 0.55,
      },
      {
        lat: 51.5074,
        lon: -0.1278,
        label: "London, UK",
        formatted: "London, UK",
        type: "city",
        importance: 0.9,
      },
      {
        lat: 48.8566,
        lon: 2.3522,
        label: "Paris, France",
        formatted: "Paris, France",
        type: "city",
        importance: 0.85,
      },
      {
        lat: 52.52,
        lon: 13.405,
        label: "Berlin, Germany",
        formatted: "Berlin, Germany",
        type: "city",
        importance: 0.8,
      },
      {
        lat: 35.6762,
        lon: 139.6503,
        label: "Tokyo, Japan",
        formatted: "Tokyo, Japan",
        type: "city",
        importance: 0.9,
      },
      {
        lat: 39.9042,
        lon: 116.4074,
        label: "Beijing, China",
        formatted: "Beijing, China",
        type: "city",
        importance: 0.85,
      },
      {
        lat: 1.3521,
        lon: 103.8198,
        label: "Singapore",
        formatted: "Singapore",
        type: "city",
        importance: 0.8,
      },
      {
        lat: -33.8688,
        lon: 151.2093,
        label: "Sydney, Australia",
        formatted: "Sydney, Australia",
        type: "city",
        importance: 0.75,
      },
      {
        lat: 43.6532,
        lon: -79.3832,
        label: "Toronto, Canada",
        formatted: "Toronto, Canada",
        type: "city",
        importance: 0.7,
      },
      {
        lat: 55.7558,
        lon: 37.6176,
        label: "Moscow, Russia",
        formatted: "Moscow, Russia",
        type: "city",
        importance: 0.65,
      },
      {
        lat: 19.4326,
        lon: -99.1332,
        label: "Mexico City, Mexico",
        formatted: "Mexico City, Mexico",
        type: "city",
        importance: 0.6,
      },
    ];

    // Check if query matches any popular locations
    const matchingPopular = popularLocations.filter(
      (location) =>
        location.formatted.toLowerCase().includes(query.toLowerCase()) ||
        location.label.toLowerCase().includes(query.toLowerCase())
    );

    // If we have good matches from popular locations, return them first
    if (matchingPopular.length > 0) {
      return NextResponse.json({
        suggestions: matchingPopular.slice(0, 5),
        source: "popular",
      });
    }

    // Use Nominatim for other searches with English-only results
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=8&addressdetails=1&extratags=1&accept-language=en`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "AtmoWise/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const suggestions = data
      .map((item: any) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        label: item.display_name,
        formatted: formatLocationName(item),
        type: item.type,
        importance: item.importance,
      }))
      .sort((a: any, b: any) => b.importance - a.importance)
      .slice(0, 5);
    return NextResponse.json({
      suggestions,
      source: "nominatim",
    });
  } catch (error: any) {
    console.error("Location suggestions API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get location suggestions",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

function formatLocationName(item: any): string {
  const parts = [];

  // Add city/town name
  if (item.address?.city) {
    parts.push(item.address.city);
  } else if (item.address?.town) {
    parts.push(item.address.town);
  } else if (item.address?.village) {
    parts.push(item.address.village);
  } else if (item.address?.hamlet) {
    parts.push(item.address.hamlet);
  }

  // Add state/region
  if (item.address?.state) {
    parts.push(item.address.state);
  } else if (item.address?.region) {
    parts.push(item.address.region);
  } else if (item.address?.county) {
    parts.push(item.address.county);
  }

  // Add country
  if (item.address?.country) {
    parts.push(item.address.country);
  }

  // If we have a good formatted name, use it
  if (parts.length >= 2) {
    return parts.join(", ");
  }

  // Fallback to display_name but clean it up
  const displayName = item.display_name || "";
  // Remove extra details and keep it simple
  return (
    displayName.split(",")[0] +
    (displayName.includes(",") ? ", " + displayName.split(",")[1] : "")
  );
}
