"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Activity, Download, Clock, Sun, Moon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedTimelineChartProps {
  airData: any[];
  symptomData: any[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  forecastData?: Array<{
    time: string;
    aqi: number;
    windSpeed: number;
    windDirection: number;
  }>;
}

const AQI_COLORS = {
  0: "#71E07E", // Good - Primary teal
  50: "#F59E0B", // Moderate - Amber
  100: "#F97316", // Unhealthy for Sensitive - Orange
  150: "#EF4444", // Unhealthy - Red
  200: "#BA5FFF", // Very Unhealthy - Accent purple
  300: "#6200D9", // Hazardous - Primary blue
};

const TIME_WINDOWS = [
  {
    start: 6,
    end: 9,
    label: "6-9 AM",
    icon: Sun,
    color: "text-yellow-500",
    description: "Best time for outdoor activities",
  },
  {
    start: 9,
    end: 12,
    label: "9 AM-12 PM",
    icon: Sun,
    color: "text-orange-500",
    description: "Good time for outdoor activities",
  },
  {
    start: 12,
    end: 16,
    label: "12-4 PM",
    icon: Sun,
    color: "text-red-500",
    description: "Avoid outdoor activities",
  },
  {
    start: 16,
    end: 18,
    label: "4-6 PM",
    icon: Sun,
    color: "text-orange-500",
    description: "Moderate outdoor activities",
  },
  {
    start: 18,
    end: 21,
    label: "6-9 PM",
    icon: Moon,
    color: "text-blue-500",
    description: "Good time for outdoor activities",
  },
  {
    start: 21,
    end: 6,
    label: "9 PM-6 AM",
    icon: Moon,
    color: "text-indigo-500",
    description: "Best time for outdoor activities",
  },
];

export function EnhancedTimelineChart({
  airData,
  symptomData,
  selectedMetric,
  onMetricChange,
  selectedPeriod,
  onPeriodChange,
  forecastData = [],
}: EnhancedTimelineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const isMobile = useIsMobile();

  // Memoize chart data calculations for performance
  const chartData = useMemo(() => {
    if (!airData || airData.length === 0) return [];
    return airData;
  }, [airData]);

  // Memoize max value calculation
  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const values = chartData.map(
      (d) => (d[selectedMetric as keyof typeof d] as number) || 0
    );
    return Math.max(...values) || 100;
  }, [chartData, selectedMetric]);

  // Get AQI color based on value
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return AQI_COLORS[0];
    if (aqi <= 100) return AQI_COLORS[50];
    if (aqi <= 150) return AQI_COLORS[100];
    if (aqi <= 200) return AQI_COLORS[150];
    if (aqi <= 300) return AQI_COLORS[200];
    return AQI_COLORS[300];
  };

  // Memoize chart calculations with color streaks
  const chartCalculations = useMemo(() => {
    if (chartData.length === 0)
      return { points: [], dataPoints: [], colorStreaks: [] };

    // Responsive chart dimensions
    const chartWidth = isMobile ? 320 : 400;
    const chartHeight = isMobile ? 160 : 200;
    const padding = isMobile ? 20 : 40;
    const chartAreaWidth = chartWidth - (padding * 2);
    const chartAreaHeight = chartHeight - (padding * 2);

    const points = chartData.map((d, i) => {
      const x =
        chartData.length === 1
          ? padding + chartAreaWidth / 2
          : padding + (i / Math.max(chartData.length - 1, 1)) * chartAreaWidth;
      const value = (d[selectedMetric as keyof typeof d] as number) || 0;
      const y = padding + chartAreaHeight - (value / Math.max(maxValue, 1)) * chartAreaHeight;
      return { x, y, value, data: d, color: getAQIColor(value) };
    });

    const dataPoints = chartData.map((d, i) => {
      const x =
        chartData.length === 1
          ? padding + chartAreaWidth / 2
          : padding + (i / Math.max(chartData.length - 1, 1)) * chartAreaWidth;
      const value = (d[selectedMetric as keyof typeof d] as number) || 0;
      const y = padding + chartAreaHeight - (value / Math.max(maxValue, 1)) * chartAreaHeight;
      return { x, y, value, data: d, color: getAQIColor(value), index: i };
    });

    // Create color streaks for AQI visualization
    const colorStreaks = [];
    let currentStreak = {
      start: 0,
      end: 0,
      color: getAQIColor(chartData[0]?.aqi || 0),
    };

    for (let i = 1; i < chartData.length; i++) {
      const currentColor = getAQIColor(chartData[i]?.aqi || 0);
      if (currentColor === currentStreak.color) {
        currentStreak.end = i;
      } else {
        colorStreaks.push({ ...currentStreak });
        currentStreak = { start: i, end: i, color: currentColor };
      }
    }
    colorStreaks.push({ ...currentStreak });

    return { points, dataPoints, colorStreaks, chartWidth, chartHeight, padding, chartAreaWidth, chartAreaHeight };
  }, [chartData, selectedMetric, maxValue]);

  // Memoize forecast calculations
  const forecastCalculations = useMemo(() => {
    if (!showForecast || forecastData.length === 0)
      return { points: [], dataPoints: [] };

    const chartWidth = isMobile ? 320 : 400;
    const chartHeight = isMobile ? 160 : 200;
    const padding = isMobile ? 20 : 40;
    const chartAreaWidth = chartWidth - (padding * 2);
    const chartAreaHeight = chartHeight - (padding * 2);

    const forecastPoints = forecastData.map((d, i) => {
      const x =
        padding +
        ((chartData.length + i) /
          Math.max(chartData.length + forecastData.length - 1, 1)) *
          chartAreaWidth;
      const value = d.aqi;
      const y = padding + chartAreaHeight - (value / Math.max(maxValue, 1)) * chartAreaHeight;
      return { x, y, value, data: d, color: getAQIColor(value) };
    });

    return { points: forecastPoints, dataPoints: forecastPoints };
  }, [forecastData, showForecast, chartData.length, maxValue, isMobile]);

  // Memoize statistics
  const statistics = useMemo(() => {
    if (chartData.length === 0)
      return {
        average: 0,
        peak: 0,
        symptoms: 0,
        days: 0,
        bestTime: null as { hour: number; value: number; index: number } | null,
        worstTime: null as {
          hour: number;
          value: number;
          index: number;
        } | null,
      };

    const values = chartData.map(
      (d) => (d[selectedMetric as keyof typeof d] as number) || 0
    );
    const average =
      values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;
    const peak = values.length > 0 ? Math.max(...values) : 0;
    const symptoms = chartData.filter((d) => d.symptom).length;
    const days = chartData.length;

    // Find best and worst times
    let bestTime = null;
    let worstTime = null;
    let bestValue = Infinity;
    let worstValue = -Infinity;

    chartData.forEach((d, i) => {
      const value = (d[selectedMetric as keyof typeof d] as number) || 0;
      const hour = new Date(d.timestamp).getHours();

      if (value < bestValue) {
        bestValue = value;
        bestTime = { hour, value, index: i };
      }
      if (value > worstValue) {
        worstValue = value;
        worstTime = { hour, value, index: i };
      }
    });

    return { average, peak, symptoms, days, bestTime, worstTime };
  }, [chartData, selectedMetric]);

  // Effect to handle loading state when metric changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedMetric, selectedPeriod]);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "aqi":
        return "AQI";
      case "pm25":
        return "PM2.5 (µg/m³)";
      case "pm10":
        return "PM10 (µg/m³)";
      case "o3":
        return "O₃ (ppb)";
      case "no2":
        return "NO₂ (ppb)";
      default:
        return "AQI";
    }
  };

  const exportData = () => {
    const csvContent = [
      ["Date", "AQI", "PM2.5", "PM10", "O3", "NO2", "Symptom Severity"].join(
        ","
      ),
      ...chartData.map((d) =>
        [d.date, d.aqi, d.pm25, d.pm10, d.o3, d.no2, d.symptom || ""].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atmowise-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Safety check for empty data
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedMetric} onValueChange={onMetricChange}>
            <SelectTrigger className={`${isMobile ? 'w-20 text-xs h-8' : 'w-24 lg:w-32 text-xs lg:text-sm h-8 lg:h-9'} min-h-[32px]`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[120px]">
              <SelectItem value="aqi">AQI</SelectItem>
              <SelectItem value="pm25">PM2.5</SelectItem>
              <SelectItem value="pm10">PM10</SelectItem>
              <SelectItem value="o3">O₃</SelectItem>
              <SelectItem value="no2">NO₂</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className={`border-[#E2E8F0] hover:bg-gray-50 ${isMobile ? 'h-8 px-2' : 'h-8 lg:h-9'}`}
          >
            <Download className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 lg:h-4 lg:w-4'}`} />
          </Button>
        </div>
      </div>

      {/* Chart Content */}
      <div>
        {/* Chart Visualization */}
        <div className={`${isMobile ? 'h-48' : 'h-56 lg:h-72'} relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4`} ref={chartRef}>
          <svg className="w-full h-full" viewBox={`0 0 ${chartCalculations.chartWidth || 400} ${chartCalculations.chartHeight || 200}`}>
            {/* Subtle grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={chartCalculations.padding || 40}
                y1={(chartCalculations.padding || 40) + i * ((chartCalculations.chartAreaHeight || 120) / 4)}
                x2={(chartCalculations.padding || 40) + (chartCalculations.chartAreaWidth || 340)}
                y2={(chartCalculations.padding || 40) + i * ((chartCalculations.chartAreaHeight || 120) / 4)}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-200 dark:text-gray-700"
              />
            ))}

            {/* Area under the curve for modern look */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6200D9" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6200D9" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <polygon
              fill="url(#areaGradient)"
              points={`${chartCalculations.padding || 40},${(chartCalculations.padding || 40) + (chartCalculations.chartAreaHeight || 120)} ${chartCalculations.points.map((p) => `${p.x},${p.y}`).join(" ")} ${(chartCalculations.padding || 40) + (chartCalculations.chartAreaWidth || 340)},${(chartCalculations.padding || 40) + (chartCalculations.chartAreaHeight || 120)}`}
            />

            {/* Main data line - modern and smooth */}
            <polyline
              fill="none"
              stroke="#6200D9"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={chartCalculations.points
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}
              className="transition-all duration-500 ease-out"
            />

            {/* Data points - clean and minimal */}
            {chartCalculations.dataPoints.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="white"
                  stroke={point.color}
                  strokeWidth="3"
                  className="transition-all duration-300 ease-out hover:r-6 hover:stroke-4"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    transform: isLoading ? "scale(0.8)" : "scale(1)",
                  }}
                />
                {/* Symptom indicator - subtle */}
                {point.data.symptom && (
                  <circle
                    cx={point.x}
                    cy={point.y + 8}
                    r="2"
                    fill="#EF4444"
                    className="animate-pulse"
                  />
                )}
              </g>
            ))}

            {/* Y-axis labels - modern typography */}
            <text x="8" y={(chartCalculations.padding || 40) + 8} fontSize={isMobile ? "10" : "12"} fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">
              High
            </text>
            <text x="8" y={(chartCalculations.padding || 40) + (chartCalculations.chartAreaHeight || 120) / 2 + 8} fontSize={isMobile ? "10" : "12"} fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">
              Med
            </text>
            <text x="8" y={(chartCalculations.padding || 40) + (chartCalculations.chartAreaHeight || 120) + 8} fontSize={isMobile ? "10" : "12"} fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">
              Low
            </text>

            {/* X-axis labels - clean dates */}
            <text
              x={chartCalculations.padding || 40}
              y={(chartCalculations.chartHeight || 200) - 8}
              fontSize={isMobile ? "10" : "12"}
              fill="currentColor"
              textAnchor="middle"
              className="text-gray-600 dark:text-gray-400 font-medium"
            >
              {chartData[chartData.length - 1]?.date || ""}
            </text>
            <text
              x={(chartCalculations.padding || 40) + (chartCalculations.chartAreaWidth || 340)}
              y={(chartCalculations.chartHeight || 200) - 8}
              fontSize={isMobile ? "10" : "12"}
              fill="currentColor"
              textAnchor="middle"
              className="text-gray-600 dark:text-gray-400 font-medium"
            >
              {chartData[0]?.date || ""}
            </text>
          </svg>

          {/* Modern Legend */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <div className="w-3 h-3 bg-[#6200D9] rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getMetricLabel(selectedMetric)}
              </span>
            </div>
            {showForecast && (
              <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                <div className="w-3 h-3 bg-[#7C3AED] rounded-full opacity-70"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Forecast</span>
              </div>
            )}
          </div>
        </div>

        {/* Modern Chart Summary */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(statistics.average)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Average</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.peak}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Peak</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.symptoms}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Symptoms</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.days}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Readings</div>
          </div>
        </div>

        {/* Best Time Recommendation */}
        {statistics.bestTime &&
          !isNaN(statistics.bestTime.hour) &&
          statistics.bestTime.hour >= 0 &&
          statistics.bestTime.hour <= 23 && (
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-green-800 dark:text-green-200">
                    Best Time for Outdoor Activities
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    {statistics.bestTime.hour.toString().padStart(2, "0")}:00 - AQI {statistics.bestTime.value}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Forecast Toggle */}
        {forecastData.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForecast(!showForecast)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {showForecast ? "Hide Forecast" : "Show Forecast"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
