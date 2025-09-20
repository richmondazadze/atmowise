import { useQuery } from "@tanstack/react-query";
import type { AirRead } from "@shared/schema";

export function useAirQuality(lat: number | null, lon: number | null) {
  return useQuery<AirRead>({
    queryKey: ["/api/air", lat, lon],
    queryFn: async () => {
      if (!lat || !lon) throw new Error("Location required");
      
      const response = await fetch(`/api/air?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        throw new Error("Failed to fetch air quality data");
      }
      return response.json();
    },
    enabled: Boolean(lat && lon),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
}

export function getAirQualityStatus(pm25: number | null, aqi: number | null, sensitivity: any = {}) {
  if (!pm25 && !aqi) {
    return {
      status: "unknown",
      statusText: "Unknown",
      rationale: "Air quality data unavailable",
      className: "bg-muted",
    };
  }

  // Use PM2.5 for primary assessment if available
  let level = 0;
  if (pm25) {
    if (pm25 <= 12) level = 1; // Good
    else if (pm25 <= 35) level = 2; // Moderate
    else if (pm25 <= 55) level = 3; // Unhealthy for sensitive
    else if (pm25 <= 150) level = 4; // Unhealthy
    else level = 5; // Very unhealthy
  } else if (aqi) {
    if (aqi <= 50) level = 1;
    else if (aqi <= 100) level = 2;
    else if (aqi <= 150) level = 3;
    else if (aqi <= 200) level = 4;
    else level = 5;
  }

  // Adjust for sensitivity
  if (sensitivity.asthma || sensitivity.pregnant || sensitivity.ageGroup === "senior") {
    if (level >= 2) level = Math.min(level + 1, 5);
  }

  switch (level) {
    case 1:
      return {
        status: "good",
        statusText: "GOOD",
        rationale: "Air quality is good. Perfect for outdoor activities.",
        className: "status-good",
      };
    case 2:
      return {
        status: "moderate",
        statusText: "MODERATE",
        rationale: "Air quality is acceptable for most people.",
        className: "status-caution",
      };
    case 3:
    case 4:
      return {
        status: "caution",
        statusText: "CAUTION",
        rationale: sensitivity.asthma 
          ? "Poor air quality. Limit outdoor activities and use inhaler if needed."
          : "Moderate to unhealthy levels detected. Sensitive individuals should limit outdoor activities.",
        className: "status-caution",
      };
    case 5:
    default:
      return {
        status: "avoid",
        statusText: "AVOID",
        rationale: "Unhealthy air quality. Avoid outdoor activities.",
        className: "status-avoid",
      };
  }
}
