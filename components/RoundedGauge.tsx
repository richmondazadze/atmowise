"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wind, Zap, Cloud } from "lucide-react";

interface RoundedGaugeProps {
  value: number | null;
  type: "PM2.5" | "PM10" | "O3" | "NO2";
  unit: string;
  threshold: number;
  className?: string;
}

export function RoundedGauge({
  value,
  type,
  unit,
  threshold,
  className = "",
}: RoundedGaugeProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "PM2.5":
        return <Activity className="h-4 w-4" />;
      case "PM10":
        return <Wind className="h-4 w-4" />;
      case "O3":
        return <Zap className="h-4 w-4" />;
      case "NO2":
        return <Cloud className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getColor = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.4) return "text-green-600";
    if (ratio <= 0.8) return "text-yellow-500";
    if (ratio <= 1.2) return "text-orange-500";
    if (ratio <= 2.0) return "text-red-500";
    return "text-red-700";
  };

  const getStatusDotColor = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.4) return "bg-green-600";
    if (ratio <= 0.8) return "bg-yellow-500";
    if (ratio <= 1.2) return "bg-orange-500";
    if (ratio <= 2.0) return "bg-red-500";
    return "bg-red-700";
  };

  const getGradientColor = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.4) return "from-green-400 to-green-500";
    if (ratio <= 0.8) return "from-yellow-400 to-yellow-500";
    if (ratio <= 1.2) return "from-orange-400 to-orange-500";
    if (ratio <= 2.0) return "from-red-400 to-red-500";
    return "from-red-600 to-red-700";
  };

  const getStatus = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.4) return "Good";
    if (ratio <= 0.8) return "Moderate";
    if (ratio <= 1.2) return "Poor";
    if (ratio <= 2.0) return "Unhealthy";
    return "Hazardous";
  };

  const getStatusColor = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.4) return "bg-green-100 text-green-800";
    if (ratio <= 0.8) return "bg-yellow-100 text-yellow-800";
    if (ratio <= 1.2) return "bg-orange-100 text-orange-800";
    if (ratio <= 2.0) return "bg-red-100 text-red-800";
    return "bg-red-200 text-red-900";
  };

  // Ensure value is a valid number, default to 0 if null/undefined
  const safeValue =
    value !== null && value !== undefined && !isNaN(value) ? value : 0;
  const displayValue = safeValue > 0 ? safeValue.toFixed(2) : "N/A";
  const ratio = safeValue > 0 ? Math.min(safeValue / threshold, 1.5) : 0;
  console.log(ratio);
  const percentage = Math.min(ratio * 100, 100);
  const angle = (percentage / 100) * 180; // Semi-circle = 180 degrees
  const gradientId = `gradient-${type}-${Math.random()
    .toString(36)
    .substr(2, 5)}`;

  return (
    <Card
      className={`bg-white border-2 transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-50 rounded-lg">{getIcon(type)}</div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{type}</h3>
              <p className="text-xs text-gray-600">{unit}</p>
            </div>
          </div>
          <div className="flex items-center justify-end">
            {/* Large screens: text badge */}
            <div className="hidden sm:block">
              <Badge
                className={`text-xs font-medium ${getStatusColor(
                  safeValue,
                  threshold
                )}`}
              >
                {getStatus(safeValue, threshold)}
              </Badge>
            </div>

            {/* Small screens: colored dot */}
            <div className="sm:hidden">
              <span
                className={`inline-block w-3 h-3 rounded-full ${getStatusDotColor(
                  safeValue,
                  threshold
                )}`}
                title={getStatus(safeValue, threshold)} // optional tooltip
              />
            </div>
          </div>
        </div>

        {/* Rounded Gauge */}
        <div className="relative flex flex-col items-center mb-4">
          {/* Semi-circular gauge container */}
          <div className="relative w-28 h-14 xs:w-32 xs:h-16 sm:w-36 sm:h-18 lg:w-36 lg:h-18">
            {/* Background arc */}
            <svg
              className="w-full h-full"
              viewBox="0 0 200 100"
              overflow="visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background arc */}
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Progress arc */}
              {safeValue > 0 && (
                <path
                  d="M 20 80 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(angle / 180) * 251.2} 251.2`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    strokeDashoffset: 0,
                    transform: "rotate(0deg)",
                    transformOrigin: "100px 80px",
                  }}
                />
              )}

              {/* Gradient definition */}
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      ratio <= 0.5
                        ? "#10B981"
                        : ratio <= 0.75
                        ? "#F59E0B"
                        : ratio <= 1.0
                        ? "#F97316"
                        : "#EF4444"
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      ratio <= 0.5
                        ? "#059669"
                        : ratio <= 0.75
                        ? "#D97706"
                        : ratio <= 1.0
                        ? "#EA580C"
                        : "#DC2626"
                    }
                  />
                </linearGradient>
              </defs>
            </svg>

            {/* Center value display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-md xs:text-xl sm:text-2xl lg:text-md font-bold ${getColor(
                    safeValue,
                    threshold
                  )}`}
                >
                  {displayValue}
                </div>
                <div className="text-xs text-gray-500">
                  {safeValue > 0 ? `${Math.round(ratio * 100)}%` : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between w-full max-w-28 xs:max-w-32 sm:max-w-36 lg:max-w-36 text-xs text-gray-500 mt-2">
            <span>0</span>
            <span className="font-medium">{threshold}</span>
            <span>{Math.round(threshold * 1.5)}</span>
          </div>
        </div>

        {/* Health Impact */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-2">
            {safeValue > 0 && (
              <div>
                {ratio <= 0.4 && "✅ Excellent air quality"}
                {ratio > 0.4 && ratio <= 0.8 && "⚠️ Good air quality"}
                {ratio > 0.8 &&
                  ratio <= 1.2 &&
                  "⚠️ Moderate - sensitive groups be cautious"}
                {ratio > 1.2 &&
                  ratio <= 2.0 &&
                  "🚨 Poor - limit outdoor activities"}
                {ratio > 2.0 && "🚨 Hazardous - avoid outdoor activities"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
