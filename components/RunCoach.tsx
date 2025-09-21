'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Wind, Sun, Cloud, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

interface RunCoachProps {
  currentAqi: number;
  currentLocation: { lat: number; lon: number; label: string };
  savedPlaces: Array<{ id: string; name: string; lat: number; lon: number; type: string }>;
  forecastData?: Array<{ time: string; aqi: number; windSpeed: number; windDirection: number }>;
}

interface ExerciseRecommendation {
  location: string;
  type: 'current' | 'saved' | 'suggested';
  aqi: number;
  windSpeed: number;
  windDirection: number;
  score: number;
  reason: string;
  timeWindow: string;
  icon: React.ReactNode;
}

export function RunCoach({ currentAqi, currentLocation, savedPlaces, forecastData = [] }: RunCoachProps) {
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate exercise score based on AQI, wind, and time
  const calculateExerciseScore = (aqi: number, windSpeed: number, windDirection: number, time: string) => {
    let score = 100;
    
    // AQI penalty (0-50 = no penalty, 51-100 = -20, 101-150 = -40, etc.)
    if (aqi > 50) score -= (aqi - 50) * 0.8;
    if (aqi > 100) score -= 20;
    if (aqi > 150) score -= 30;
    
    // Wind bonus (gentle breeze is good, strong wind is bad)
    if (windSpeed > 5 && windSpeed < 15) score += 10; // Good wind
    if (windSpeed > 20) score -= 15; // Too windy
    if (windSpeed < 2) score -= 5; // No wind (stagnant air)
    
    // Time bonus (early morning and evening are better)
    const hour = new Date(time).getHours();
    if (hour >= 6 && hour <= 9) score += 15; // Morning
    if (hour >= 18 && hour <= 20) score += 10; // Evening
    if (hour >= 12 && hour <= 16) score -= 10; // Afternoon (higher pollution)
    
    return Math.max(0, Math.min(100, score));
  };

  // Get wind direction as text
  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Get exercise recommendation icon
  const getRecommendationIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 60) return <Sun className="h-5 w-5 text-yellow-500" />;
    if (score >= 40) return <Cloud className="h-5 w-5 text-orange-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  // Get exercise recommendation reason
  const getRecommendationReason = (aqi: number, windSpeed: number, score: number) => {
    if (score >= 80) return "Excellent conditions for outdoor exercise!";
    if (score >= 60) return "Good conditions with minor air quality concerns.";
    if (score >= 40) return "Moderate air quality. Consider shorter workouts.";
    if (score >= 20) return "Poor air quality. Indoor exercise recommended.";
    return "Very poor air quality. Avoid outdoor exercise.";
  };

  // Generate recommendations
  useEffect(() => {
    const generateRecommendations = () => {
      setIsLoading(true);
      
      const recs: ExerciseRecommendation[] = [];
      
      // Current location
      const currentWindSpeed = forecastData[0]?.windSpeed || 5;
      const currentWindDirection = forecastData[0]?.windDirection || 0;
      const currentTime = new Date().toISOString();
      
      recs.push({
        location: currentLocation.label,
        type: 'current',
        aqi: currentAqi,
        windSpeed: currentWindSpeed,
        windDirection: currentWindDirection,
        score: calculateExerciseScore(currentAqi, currentWindSpeed, currentWindDirection, currentTime),
        reason: getRecommendationReason(currentAqi, currentWindSpeed, calculateExerciseScore(currentAqi, currentWindSpeed, currentWindDirection, currentTime)),
        timeWindow: "Now",
        icon: getRecommendationIcon(calculateExerciseScore(currentAqi, currentWindSpeed, currentWindDirection, currentTime))
      });

      // Saved places (simulate AQI data)
      savedPlaces.forEach(place => {
        // Simulate different AQI for different locations
        const simulatedAqi = currentAqi + (Math.random() - 0.5) * 20;
        const simulatedWindSpeed = currentWindSpeed + (Math.random() - 0.5) * 5;
        const simulatedWindDirection = currentWindDirection + (Math.random() - 0.5) * 45;
        
        recs.push({
          location: place.name,
          type: 'saved',
          aqi: Math.max(0, Math.round(simulatedAqi)),
          windSpeed: Math.max(0, simulatedWindSpeed),
          windDirection: simulatedWindDirection,
          score: calculateExerciseScore(simulatedAqi, simulatedWindSpeed, simulatedWindDirection, currentTime),
          reason: getRecommendationReason(simulatedAqi, simulatedWindSpeed, calculateExerciseScore(simulatedAqi, simulatedWindSpeed, simulatedWindDirection, currentTime)),
          timeWindow: "Now",
          icon: getRecommendationIcon(calculateExerciseScore(simulatedAqi, simulatedWindSpeed, simulatedWindDirection, currentTime))
        });
      });

      // Sort by score (highest first)
      recs.sort((a, b) => b.score - a.score);
      
      setRecommendations(recs.slice(0, 3)); // Top 3 recommendations
      setIsLoading(false);
    };

    generateRecommendations();
  }, [currentAqi, currentLocation, savedPlaces, forecastData]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6200D9]"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Navigation className="h-5 w-5 text-[#6200D9]" />
          Exercise Coach
        </CardTitle>
        <p className="text-sm text-gray-600">
          Find the best places and times for outdoor exercise based on air quality
        </p>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="border rounded-xl p-4 space-y-3 bg-white shadow-sm">
            {/* Header - Mobile Optimized */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {rec.icon}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {rec.location}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {rec.type === 'current' ? 'Current Location' : 'Saved Place'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-[#6200D9]">{rec.score}</div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>

            {/* Environmental Data - Mobile Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{rec.windSpeed.toFixed(1)} mph {getWindDirection(rec.windDirection)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{rec.timeWindow}</span>
              </div>
            </div>

            {/* AQI and Action - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Badge 
                className={`w-fit ${
                  rec.score >= 80 ? 'bg-green-100 text-green-700 border-green-200' :
                  rec.score >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  rec.score >= 40 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }`}
              >
                AQI: {rec.aqi}
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-8 px-3 w-full sm:w-auto"
              >
                View Details
              </Button>
            </div>

            {/* Recommendation - Mobile Optimized */}
            <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
              {rec.reason}
            </p>
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center text-gray-500 py-8 px-4">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No exercise recommendations available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
