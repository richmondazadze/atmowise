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
  0: "#71E07E", // Good - Green
  50: "#F59E0B", // Moderate - Yellow
  100: "#EF4444", // Unhealthy for Sensitive - Orange
  150: "#DC2626", // Unhealthy - Red
  200: "#7C3AED", // Very Unhealthy - Purple
  300: "#4C1D95", // Hazardous - Dark Purple
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
        <div className={`${isMobile ? 'h-40' : 'h-48 lg:h-64'} relative`} ref={chartRef}>
          <svg className="w-full h-full" viewBox={`0 0 ${chartCalculations.chartWidth || 400} ${chartCalculations.chartHeight || 200}`}>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={chartCalculations.padding || 40}
                y1={(chartCalculations.padding || 40) + i * ((chartCalculations.chartAreaHeight || 120) / 4)}
                x2={(chartCalculations.padding || 40) + (chartCalculations.chartAreaWidth || 340)}
                y2={(chartCalculations.padding || 40) + i * ((chartCalculations.chartAreaHeight || 120) / 4)}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            ))}

            {/* Color streaks for AQI visualization */}
            {chartCalculations.colorStreaks.map((streak, i) => {
              const padding = chartCalculations.padding || 40;
              const chartAreaWidth = chartCalculations.chartAreaWidth || 340;
              const chartAreaHeight = chartCalculations.chartAreaHeight || 120;
              const startX =
                chartData.length === 1
                  ? padding + chartAreaWidth / 2
                  : padding + (streak.start / Math.max(chartData.length - 1, 1)) * chartAreaWidth;
              const endX =
                chartData.length === 1
                  ? padding + chartAreaWidth / 2
                  : padding + (streak.end / Math.max(chartData.length - 1, 1)) * chartAreaWidth;
              return (
                <rect
                  key={i}
                  x={startX}
                  y={padding}
                  width={endX - startX}
                  height={chartAreaHeight}
                  fill={streak.color}
                  opacity="0.1"
                />
              );
            })}

            {/* Historical data line with smooth transition */}
            <polyline
              fill="none"
              stroke="#6200D9"
              strokeWidth="2"
              points={chartCalculations.points
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}
              className="transition-all duration-300 ease-in-out"
            />

            {/* Forecast line (dashed) */}
            {showForecast && forecastCalculations.points.length > 0 && (
              <polyline
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2"
                strokeDasharray="5,5"
                points={forecastCalculations.points
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                className="transition-all duration-300 ease-in-out"
              />
            )}

            {/* Data points with hover effects */}
            {chartCalculations.dataPoints.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={point.color}
                  className="hover:r-6 transition-all cursor-pointer"
                  style={{
                    transition: "all 0.3s ease-in-out",
                    transform: isLoading ? "scale(0.8)" : "scale(1)",
                  }}
                />
                {point.data.symptom && (
                  <circle
                    cx={point.x}
                    cy={180}
                    r="3"
                    fill="#EF4444"
                    className="animate-pulse"
                  />
                )}
              </g>
            ))}

            {/* Forecast data points */}
            {showForecast &&
              forecastCalculations.dataPoints.map((point, i) => (
                <g key={`forecast-${i}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={point.color}
                    className="hover:r-5 transition-all cursor-pointer opacity-70"
                  />
                </g>
              ))}

            {/* Y-axis labels */}
            <text x="5" y={(chartCalculations.padding || 40) + 5} fontSize={isMobile ? "8" : "10"} fill="#64748B">
              High
            </text>
            <text x="5" y={(chartCalculations.padding || 40) + (chartCalculations.chartAreaHeight || 120) / 2 + 5} fontSize={isMobile ? "8" : "10"} fill="#64748B">
              Med
            </text>
            <text x="5" y={(chartCalculations.padding || 40) + (chartCalculations.chartAreaHeight || 120) + 5} fontSize={isMobile ? "8" : "10"} fill="#64748B">
              Low
            </text>

            {/* X-axis labels */}
            <text
              x={chartCalculations.padding || 40}
              y={(chartCalculations.chartHeight || 200) - 5}
              fontSize={isMobile ? "8" : "10"}
              fill="#64748B"
              textAnchor="middle"
            >
              {chartData[chartData.length - 1]?.date || ""}
            </text>
            <text
              x={(chartCalculations.padding || 40) + (chartCalculations.chartAreaWidth || 340)}
              y={(chartCalculations.chartHeight || 200) - 5}
              fontSize={isMobile ? "8" : "10"}
              fill="#64748B"
              textAnchor="middle"
            >
              {chartData[0]?.date || ""}
            </text>
          </svg>

          {/* Legend */}
          <div className={`absolute bottom-1 left-2 sm:bottom-2 sm:left-4 flex flex-wrap items-center gap-2 sm:gap-4 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            <div className="flex items-center gap-1">
              <div className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-[#6200D9] rounded-full`}></div>
              <span className="text-[#64748B]">
                {getMetricLabel(selectedMetric)}
              </span>
            </div>
            {showForecast && (
              <div className="flex items-center gap-1">
                <div
                  className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-[#7C3AED] rounded-full`}
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #7C3AED, #7C3AED 2px, transparent 2px, transparent 4px)",
                  }}
                ></div>
                <span className="text-[#64748B]">Forecast</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-[#EF4444] rounded-full animate-pulse`}></div>
              <span className="text-[#64748B]">Symptoms</span>
            </div>
          </div>
        </div>

        {/* Chart Summary with smooth transitions */}
        <div className={`mt-3 lg:mt-4 ${isMobile ? 'p-3' : 'p-3 lg:p-4'} bg-gray-50 rounded-lg transition-all duration-300`}>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'} gap-3 text-center`}>
            <div className="transition-all duration-300">
              <div className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} font-bold text-[#0A1C40]`}>
                {Math.round(statistics.average)}
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-[#64748B]`}>Average</div>
            </div>
            <div className="transition-all duration-300">
              <div className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} font-bold text-[#0A1C40]`}>
                {statistics.peak}
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-[#64748B]`}>Peak</div>
            </div>
            <div className="transition-all duration-300">
              <div className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} font-bold text-[#0A1C40]`}>
                {statistics.symptoms}
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-[#64748B]`}>Symptoms</div>
            </div>
            <div className="transition-all duration-300">
              <div className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} font-bold text-[#0A1C40]`}>
                {statistics.days}
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-[#64748B]`}>Readings</div>
            </div>
          </div>
        </div>

        {/* Best Time Windows */}
        {statistics.bestTime &&
          !isNaN(statistics.bestTime.hour) &&
          statistics.bestTime.hour >= 0 &&
          statistics.bestTime.hour <= 23 && (
            <div className={`mt-3 lg:mt-4 ${isMobile ? 'p-3' : 'p-3 lg:p-4'} bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-600 dark:text-green-400`} />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-green-800 dark:text-green-200`}>
                  Best Time for Outdoor Activities
                </span>
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-green-700 dark:text-green-300`}>
                {statistics.bestTime.hour.toString().padStart(2, "0")}:00 - AQI{" "}
                {statistics.bestTime.value} (Lowest pollution)
              </div>
            </div>
          )}

        {/* Forecast Toggle */}
        {forecastData.length > 0 && (
          <div className={`${isMobile ? 'mt-3' : 'mt-4'} flex justify-center`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForecast(!showForecast)}
              className={`${isMobile ? 'text-xs h-8 px-3' : 'text-xs'}`}
            >
              {showForecast ? "Hide Forecast" : "Show Forecast"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
