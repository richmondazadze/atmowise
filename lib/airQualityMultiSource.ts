// Multi-Source Air Quality System with Robust Fallback Logic
// Primary: OpenWeather (Global) → Fallback: AirNow (US) → Demo Data

// 1. Geocoding Utility - Address to Coordinates
export async function getCoordinates(address: string) {
  const apiKey = process.env.GEOCODE_API_KEY;
  if (!apiKey) {
    throw new Error('Geocoding API key not configured');
  }
  
  const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Geocoding API error:', res.status, res.statusText);
    throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (data.length) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      label: data[0].display_name || address
    };
  }
  return null;
}

// 2. OpenWeather API - Primary Source (Global Coverage)
export async function getOpenWeatherAirQuality({ lat, lon, apiKey }: { lat: number, lon: number, apiKey: string }) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("OpenWeather API failed");
  const data = await res.json();
  // data.list: [{main: {aqi}, components: {pm2_5, pm10, no2, o3, ...}}]
  if (data.list?.length) return data.list[0];
  return null; // fallback to AirNow if null
}

// 3. AirNow API - US Fallback (Official EPA Data)
export async function getAirNowAirQuality({ lat, lon, apiKey }: { lat: number, lon: number, apiKey: string }) {
  // Rounded to 4 decimals for best match with API
  const url = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&distance=25&API_KEY=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('AirNow API failed');
  const data = await res.json();
  if (data?.length) return data; // array of pollutants
  return null;
}

// 4. Process OpenWeather Data
export function processOpenWeatherData(openWeatherData: any) {
  if (!openWeatherData) return null;

  const { main, components } = openWeatherData;
  
  // Convert OpenWeather AQI (1-5) to standard AQI (0-500)
  const aqiMapping: Record<number, number> = {
    1: 50,   // Good
    2: 100,  // Fair
    3: 150,  // Moderate
    4: 200,  // Poor
    5: 300   // Very Poor
  };

  const standardAQI = aqiMapping[main.aqi] || 50;
  
  return {
    pm25: components.pm2_5 || null,
    pm10: components.pm10 || null,
    o3: components.o3 || null,
    no2: components.no2 || null,
    aqi: standardAQI,
    lastUpdated: new Date(),
    source: 'openweather',
    rawData: openWeatherData,
    category: getAQICategory(standardAQI),
    dominantPollutant: getDominantPollutant(components)
  };
}

// 5. Process AirNow Data
export function processAirNowData(airNowData: any[]) {
  if (!airNowData || airNowData.length === 0) return null;

  // Find the highest AQI value (most concerning pollutant)
  let maxAQI = 0;
  let dominantPollutant = '';
  let category = 'Unknown';

  const processedData: Record<string, any> = {};

  airNowData.forEach((item: any) => {
    const param = item.ParameterName;
    const aqi = item.AQI;
    const categoryName = item.Category?.Name || 'Unknown';

    // Store the data
    processedData[param.toLowerCase()] = {
      value: item.Value || null,
      aqi: aqi,
      category: categoryName,
      unit: item.Unit || 'μg/m³'
    };

    // Track the highest AQI
    if (aqi > maxAQI) {
      maxAQI = aqi;
      dominantPollutant = param;
      category = categoryName;
    }
  });

  return {
    pm25: processedData['pm2.5']?.value || null,
    pm10: processedData['pm10']?.value || null,
    o3: processedData['o3']?.value || null,
    no2: processedData['no2']?.value || null,
    aqi: maxAQI || null,
    lastUpdated: new Date(),
    source: 'airnow',
    rawData: airNowData,
    category: category,
    dominantPollutant: dominantPollutant,
    details: processedData
  };
}

// 6. Generate Demo Data (Final Fallback)
export function generateDemoData(lat: number, lon: number) {
  // Generate consistent demo data based on location (no random values)
  const basePM25 = 25;
  const basePM10 = 45;
  const baseO3 = 60;
  const baseNO2 = 30;
  
  // Calculate AQI based on PM2.5 (simplified)
  let aqi = 75;
  if (basePM25 > 12) aqi = 100;
  if (basePM25 > 35.4) aqi = 150;
  if (basePM25 > 55.4) aqi = 200;
  if (basePM25 > 150.4) aqi = 300;

  return {
    pm25: basePM25,
    pm10: basePM10,
    o3: baseO3,
    no2: baseNO2,
    aqi: aqi,
    lastUpdated: new Date(),
    source: 'demo',
    rawData: { note: 'Demo data - APIs unavailable' },
    category: getAQICategory(aqi),
    dominantPollutant: 'PM2.5'
  };
}

// 7. Main Air Quality Function with Fallback Logic
export async function getAirQualityForLocation(
  lat: number, 
  lon: number, 
  openWeatherApiKey: string, 
  airNowApiKey?: string
) {
  // Try OpenWeather first (works everywhere)
  try {
    const openWeatherData = await getOpenWeatherAirQuality({ 
      lat, 
      lon, 
      apiKey: openWeatherApiKey 
    });
    
    if (openWeatherData) {
      const processed = processOpenWeatherData(openWeatherData);
      if (processed) {
        return {
          success: true,
          data: processed,
          source: 'openweather'
        };
      }
    }
  } catch (error) {
    console.warn('OpenWeather API failed:', error);
  }

  // Try AirNow fallback (US-only)
  if (airNowApiKey && airNowApiKey !== 'your_airnow_key') {
    try {
      // Check if location is in the US (rough check)
      if (lat >= 24.0 && lat <= 49.0 && lon >= -125.0 && lon <= -66.0) {
        const airNowData = await getAirNowAirQuality({ 
          lat, 
          lon, 
          apiKey: airNowApiKey 
        });
        
        if (airNowData) {
          const processed = processAirNowData(airNowData);
          if (processed) {
            return {
              success: true,
              data: processed,
              source: 'airnow'
            };
          }
        }
      }
    } catch (error) {
      console.warn('AirNow API failed:', error);
    }
  }

  // Final fallback: demo data
  return {
    success: true,
    data: generateDemoData(lat, lon),
    source: 'demo'
  };
}

// 8. Get Air Quality for Address with Fallback
export async function getAirQualityForAddress(
  address: string, 
  openWeatherApiKey: string, 
  airNowApiKey?: string,
  geocodeApiKey?: string
) {
  try {
    // Use the provided geocoding API key or fall back to environment variable
    const apiKey = geocodeApiKey || process.env.GEOCODE_API_KEY;
    if (!apiKey) {
      throw new Error('Geocoding API key not configured');
    }
    
    const location = await getCoordinatesWithKey(address, apiKey);
    if (!location) {
      throw new Error('Location not found');
    }

    const result = await getAirQualityForLocation(
      location.lat, 
      location.lon, 
      openWeatherApiKey, 
      airNowApiKey
    );

    return {
      location,
      airQuality: result.data,
      source: result.source
    };
  } catch (error) {
    throw new Error(`Failed to get air quality for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function for geocoding with API key
async function getCoordinatesWithKey(address: string, apiKey: string) {
  // Try multiple geocoding services as fallback
  const services = [
    // Primary: geocode.maps.co with API key
    {
      name: 'geocode.maps.co',
      url: `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${apiKey}`,
      parser: (data: any) => {
        if (data.length) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            label: data[0].display_name || address
          };
        }
        return null;
      }
    },
    // Fallback: Nominatim (OpenStreetMap) - free, no API key required
    {
      name: 'nominatim',
      url: `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      parser: (data: any) => {
        if (data.length) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            label: data[0].display_name || address
          };
        }
        return null;
      }
    }
  ];

  for (const service of services) {
    try {
      console.log(`Trying geocoding service: ${service.name}`);
      const res = await fetch(service.url, {
        headers: {
          'User-Agent': 'AtmoWise/1.0'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        const result = service.parser(data);
        if (result) {
          console.log(`Geocoding successful with ${service.name}:`, result);
          return result;
        }
      } else {
        console.warn(`Geocoding service ${service.name} failed:`, res.status, res.statusText);
      }
    } catch (error) {
      console.warn(`Geocoding service ${service.name} error:`, error);
    }
  }

  throw new Error('All geocoding services failed');
}

// 9. Helper Functions
export function getAQICategory(aqi: number) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getDominantPollutant(components: any) {
  const pollutants = [
    { name: 'PM2.5', value: components.pm2_5 },
    { name: 'PM10', value: components.pm10 },
    { name: 'O3', value: components.o3 },
    { name: 'NO2', value: components.no2 }
  ];
  
  const dominant = pollutants.reduce((max, current) => 
    (current.value || 0) > (max.value || 0) ? current : max
  );
  
  return dominant.name;
}

export function getAQIInfo(aqi: number | null) {
  if (!aqi) return { color: 'bg-gray-100 text-gray-600', label: 'Unknown', description: 'No data available' };

  if (aqi <= 50) {
    return { 
      color: 'bg-green-100 text-green-800', 
      label: 'Good', 
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.' 
    };
  } else if (aqi <= 100) {
    return { 
      color: 'bg-yellow-100 text-yellow-800', 
      label: 'Moderate', 
      description: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.' 
    };
  } else if (aqi <= 150) {
    return { 
      color: 'bg-orange-100 text-orange-800', 
      label: 'Unhealthy for Sensitive Groups', 
      description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.' 
    };
  } else if (aqi <= 200) {
    return { 
      color: 'bg-red-100 text-red-800', 
      label: 'Unhealthy', 
      description: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.' 
    };
  } else if (aqi <= 300) {
    return { 
      color: 'bg-purple-100 text-purple-800', 
      label: 'Very Unhealthy', 
      description: 'Health alert: The risk of health effects is increased for everyone.' 
    };
  } else {
    return { 
      color: 'bg-red-200 text-red-900', 
      label: 'Hazardous', 
      description: 'Health warning of emergency conditions: everyone is more likely to be affected.' 
    };
  }
}
