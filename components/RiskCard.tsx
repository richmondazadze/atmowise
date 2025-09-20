"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wind,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { RoundedGauge } from "@/components/RoundedGauge";
import type { AirRead, Profile } from "@shared/schema";

interface RiskCardProps {
  airData: AirRead | null;
  profile: Profile | null;
  isLoading?: boolean;
  lastUpdated?: Date;
}

export function RiskCard({
  airData,
  profile,
  isLoading,
  lastUpdated,
}: RiskCardProps) {
  // Calculate risk status based on AQI and user sensitivity
  const getRiskStatus = (aqi: number | null, sensitivity: any) => {
    if (!aqi)
      return {
        status: "Unknown",
        color: "bg-gray-500",
        textColor: "text-gray-600",
        icon: AlertTriangle,
      };

    // Adjust thresholds based on sensitivity
    const isHighRisk =
      sensitivity?.asthma ||
      sensitivity?.pregnant ||
      sensitivity?.cardiopulmonary;
    const ageAdjustment =
      sensitivity?.ageGroup === "child" || sensitivity?.ageGroup === "senior"
        ? -20
        : 0;

    const adjustedThresholds = {
      good: isHighRisk ? 40 : 50,
      moderate: isHighRisk ? 80 : 100,
      unhealthy: isHighRisk ? 120 : 150,
      veryUnhealthy: isHighRisk ? 180 : 200,
    };

    if (aqi <= adjustedThresholds.good + ageAdjustment) {
      return {
        status: "Good",
        color: "bg-[#71E07E]",
        textColor: "text-[#71E07E]",
        icon: CheckCircle,
        advice: isHighRisk
          ? "Great air quality! Perfect time for outdoor activities."
          : "Excellent air quality for everyone.",
      };
    }
    if (aqi <= adjustedThresholds.moderate + ageAdjustment) {
      return {
        status: "Caution",
        color: "bg-[#F59E0B]",
        textColor: "text-[#F59E0B]",
        icon: AlertTriangle,
        advice: isHighRisk
          ? "Consider limiting outdoor activities. Use air purifier indoors."
          : "Moderate air quality. Sensitive individuals should limit outdoor exertion.",
      };
    }
    if (aqi <= adjustedThresholds.unhealthy + ageAdjustment) {
      return {
        status: "Avoid",
        color: "bg-[#EF4444]",
        textColor: "text-[#EF4444]",
        icon: AlertTriangle,
        advice: isHighRisk
          ? "Stay indoors. Use air purifier and avoid outdoor activities."
          : "Unhealthy air quality. Limit outdoor activities and consider wearing a mask.",
      };
    }
    return {
      status: "Avoid",
      color: "bg-[#DC2626]",
      textColor: "text-[#DC2626]",
      icon: AlertTriangle,
      advice:
        "Very unhealthy air quality. Stay indoors and avoid all outdoor activities.",
    };
  };

  const getDominantPollutant = (airData: AirRead | null) => {
    if (!airData) return null;

    const pollutants = [
      { name: "PM2.5", value: airData.pm25, threshold: 35 },
      { name: "PM10", value: airData.pm10, threshold: 150 },
      { name: "O₃", value: airData.o3, threshold: 70 },
      { name: "NO₂", value: airData.no2, threshold: 100 },
    ].filter((p) => p.value !== null && p.value !== undefined);

    if (pollutants.length === 0) return null;

    // Find the pollutant with highest ratio to its threshold
    const dominant = pollutants.reduce((max, current) => {
      const currentRatio = (current.value || 0) / current.threshold;
      const maxRatio = (max.value || 0) / max.threshold;
      return currentRatio > maxRatio ? current : max;
    });

    return dominant;
  };

  const riskInfo = getRiskStatus(airData?.aqi || null, profile?.sensitivity);
  const dominantPollutant = getDominantPollutant(airData);
  const StatusIcon = riskInfo.icon;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100/50">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6200D9]"></div>
          <span className="ml-3 text-[#64748B] font-medium">
            Loading air quality data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 lg:p-6 hover:shadow-lg transition-all duration-300 shadow-sm border border-gray-100/50">
      <div className="pb-4 lg:pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 lg:w-12 lg:h-12 ${riskInfo.color} rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20`}
          >
            <StatusIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white drop-shadow-sm" />
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">
            Air Quality Status
          </h3>
        </div>
      </div>
      <div className="space-y-4">
        {/* Main Status - Premium Mobile Design */}
        <div className="text-center p-5 lg:p-6 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] rounded-2xl border border-gray-100/50">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Badge
              className={`${riskInfo.color} text-white text-sm lg:text-base px-4 py-2 rounded-full font-bold shadow-sm`}
            >
              {riskInfo.status}
            </Badge>
            {airData?.aqi && (
              <span className="text-3xl lg:text-4xl font-bold text-[#0A1C40] tracking-tight">
                {airData.aqi}
              </span>
            )}
          </div>
          <p className="text-sm lg:text-base text-[#64748B] font-semibold leading-relaxed">
            {riskInfo.advice}
          </p>
        </div>

        {/* Pollutant Rounded Gauges - Mobile Optimized */}
        {airData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {airData.pm25 !== null && (
              <RoundedGauge
                value={airData.pm25}
                type="PM2.5"
                unit="μg/m³"
                threshold={25}
              />
            )}
            {airData.pm10 !== null && (
              <RoundedGauge
                value={airData.pm10}
                type="PM10"
                unit="μg/m³"
                threshold={50}
              />
            )}
            {airData.o3 !== null && (
              <RoundedGauge
                value={airData.o3}
                type="O3"
                unit="ppb"
                threshold={50}
              />
            )}
            {airData.no2 !== null && (
              <RoundedGauge
                value={airData.no2}
                type="NO2"
                unit="ppb"
                threshold={100}
              />
            )}
          </div>
        )}

        {/* Dominant Pollutant - Mobile Optimized */}
        {dominantPollutant && (
          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className="text-xs border-gray-200 text-[#64748B] px-3 py-1.5 rounded-full font-medium"
            >
              Primary concern: {dominantPollutant.name}
            </Badge>
          </div>
        )}

        {/* Data Source & Timestamp - Mobile Optimized */}
        <div className="flex items-center justify-between text-xs text-[#64748B] bg-gray-50/50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span className="font-medium">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : airData?.timestamp
                ? `Updated ${new Date(airData.timestamp).toLocaleTimeString()}`
                : "No recent data"}
            </span>
          </div>
          {airData?.source && (
            <Badge
              variant="outline"
              className="text-xs px-2 py-1 rounded-full border-gray-200 font-medium"
            >
              {airData.source === "openweather"
                ? "OpenWeather"
                : airData.source === "airnow"
                ? "AirNow"
                : "Demo Data"}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
