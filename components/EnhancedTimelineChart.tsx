'use client'

import { useEffect, useRef, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Activity, Download, Clock, Sun, Moon } from "lucide-react";

interface EnhancedTimelineChartProps {
  airData: any[];
  symptomData: any[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  forecastData?: Array<{ time: string; aqi: number; windSpeed: number; windDirection: number }>;
}

const AQI_COLORS = {
  0: '#71E07E',    // Good - Green
  50: '#F59E0B',   // Moderate - Yellow
  100: '#EF4444',  // Unhealthy for Sensitive - Orange
  150: '#DC2626',  // Unhealthy - Red
  200: '#7C3AED',  // Very Unhealthy - Purple
  300: '#4C1D95'   // Hazardous - Dark Purple
};

const TIME_WINDOWS = [
  { start: 6, end: 9, label: '6-9 AM', icon: Sun, color: 'text-yellow-500', description: 'Best time for outdoor activities' },
  { start: 9, end: 12, label: '9 AM-12 PM', icon: Sun, color: 'text-orange-500', description: 'Good time for outdoor activities' },
  { start: 12, end: 16, label: '12-4 PM', icon: Sun, color: 'text-red-500', description: 'Avoid outdoor activities' },
  { start: 16, end: 18, label: '4-6 PM', icon: Sun, color: 'text-orange-500', description: 'Moderate outdoor activities' },
  { start: 18, end: 21, label: '6-9 PM', icon: Moon, color: 'text-blue-500', description: 'Good time for outdoor activities' },
  { start: 21, end: 6, label: '9 PM-6 AM', icon: Moon, color: 'text-indigo-500', description: 'Best time for outdoor activities' }
];

export function EnhancedTimelineChart({ 
  airData, 
  symptomData, 
  selectedMetric, 
  onMetricChange,
  selectedPeriod,
  onPeriodChange,
  forecastData = []
}: EnhancedTimelineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  // Memoize chart data calculations for performance
  const chartData = useMemo(() => {
    if (!airData || airData.length === 0) return [];
    return airData;
  }, [airData]);

  // Memoize max value calculation
  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const values = chartData.map(d => d[selectedMetric as keyof typeof d] as number || 0);
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
    if (chartData.length === 0) return { points: [], dataPoints: [], colorStreaks: [] };

    const points = chartData.map((d, i) => {
      const x = chartData.length === 1 ? 40 + 170 : 40 + (i / Math.max(chartData.length - 1, 1)) * 340;
      const value = d[selectedMetric as keyof typeof d] as number || 0;
      const y = 170 - ((value / Math.max(maxValue, 1)) * 120);
      return { x, y, value, data: d, color: getAQIColor(value) };
    });

    const dataPoints = chartData.map((d, i) => {
      const x = chartData.length === 1 ? 40 + 170 : 40 + (i / Math.max(chartData.length - 1, 1)) * 340;
      const value = d[selectedMetric as keyof typeof d] as number || 0;
      const y = 170 - ((value / Math.max(maxValue, 1)) * 120);
      return { x, y, value, data: d, color: getAQIColor(value), index: i };
    });

    // Create color streaks for AQI visualization
    const colorStreaks = [];
    let currentStreak = { start: 0, end: 0, color: getAQIColor(chartData[0]?.aqi || 0) };
    
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

    return { points, dataPoints, colorStreaks };
  }, [chartData, selectedMetric, maxValue]);

  // Memoize forecast calculations
  const forecastCalculations = useMemo(() => {
    if (!showForecast || forecastData.length === 0) return { points: [], dataPoints: [] };

    const forecastPoints = forecastData.map((d, i) => {
      const x = 40 + ((chartData.length + i) / Math.max(chartData.length + forecastData.length - 1, 1)) * 340;
      const value = d.aqi;
      const y = 170 - ((value / Math.max(maxValue, 1)) * 120);
      return { x, y, value, data: d, color: getAQIColor(value) };
    });

    return { points: forecastPoints, dataPoints: forecastPoints };
  }, [forecastData, showForecast, chartData.length, maxValue]);

  // Memoize statistics
  const statistics = useMemo(() => {
    if (chartData.length === 0) return { 
      average: 0, 
      peak: 0, 
      symptoms: 0, 
      days: 0, 
      bestTime: null as { hour: number; value: number; index: number } | null, 
      worstTime: null as { hour: number; value: number; index: number } | null 
    };

    const values = chartData.map(d => d[selectedMetric as keyof typeof d] as number || 0);
    const average = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    const peak = values.length > 0 ? Math.max(...values) : 0;
    const symptoms = chartData.filter(d => d.symptom).length;
    const days = chartData.length;

    // Find best and worst times
    let bestTime = null;
    let worstTime = null;
    let bestValue = Infinity;
    let worstValue = -Infinity;

    chartData.forEach((d, i) => {
      const value = d[selectedMetric as keyof typeof d] as number || 0;
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
      case 'aqi': return 'AQI';
      case 'pm25': return 'PM2.5 (µg/m³)';
      case 'pm10': return 'PM10 (µg/m³)';
      case 'o3': return 'O₃ (ppb)';
      case 'no2': return 'NO₂ (ppb)';
      default: return 'AQI';
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'AQI', 'PM2.5', 'PM10', 'O3', 'NO2', 'Symptom Severity'].join(','),
      ...chartData.map(d => [
        d.date,
        d.aqi,
        d.pm25,
        d.pm10,
        d.o3,
        d.no2,
        d.symptom || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atmowise-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Safety check for empty data
  if (chartData.length === 0) {
    return (
      <Card className="card-solid rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-solid rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg lg:text-xl font-bold text-[#0A1C40] flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#6200D9] to-[#4C00A8] rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            Air Quality Trends
            {isLoading && (
              <div className="ml-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6200D9]"></div>
              </div>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedMetric} onValueChange={onMetricChange}>
              <SelectTrigger className="w-24 lg:w-32 text-xs lg:text-sm h-8 lg:h-9 min-h-[36px]">
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
              className="border-[#E2E8F0] hover:bg-gray-50 h-8 lg:h-9"
            >
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Chart Visualization */}
        <div className="h-48 lg:h-64 relative" ref={chartRef}>
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="40"
                y1={40 + i * 30}
                x2="380"
                y2={40 + i * 30}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            ))}
            
            {/* Color streaks for AQI visualization */}
            {chartCalculations.colorStreaks.map((streak, i) => {
              const startX = chartData.length === 1 ? 40 + 170 : 40 + (streak.start / Math.max(chartData.length - 1, 1)) * 340;
              const endX = chartData.length === 1 ? 40 + 170 : 40 + (streak.end / Math.max(chartData.length - 1, 1)) * 340;
              return (
                <rect
                  key={i}
                  x={startX}
                  y="40"
                  width={endX - startX}
                  height="120"
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
              points={chartCalculations.points.map(p => `${p.x},${p.y}`).join(' ')}
              className="transition-all duration-300 ease-in-out"
            />
            
            {/* Forecast line (dashed) */}
            {showForecast && forecastCalculations.points.length > 0 && (
              <polyline
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2"
                strokeDasharray="5,5"
                points={forecastCalculations.points.map(p => `${p.x},${p.y}`).join(' ')}
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
                    transition: 'all 0.3s ease-in-out',
                    transform: isLoading ? 'scale(0.8)' : 'scale(1)'
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
            {showForecast && forecastCalculations.dataPoints.map((point, i) => (
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
            <text x="10" y="45" fontSize="10" fill="#64748B">High</text>
            <text x="10" y="105" fontSize="10" fill="#64748B">Med</text>
            <text x="10" y="165" fontSize="10" fill="#64748B">Low</text>
            
            {/* X-axis labels */}
            <text x="40" y="195" fontSize="10" fill="#64748B" textAnchor="middle">
              {chartData[0]?.date.split('-')[2] || ''}
            </text>
            <text x="380" y="195" fontSize="10" fill="#64748B" textAnchor="middle">
              {chartData[chartData.length - 1]?.date.split('-')[2] || ''}
            </text>
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-2 left-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#6200D9] rounded-full"></div>
              <span className="text-[#64748B]">{getMetricLabel(selectedMetric)}</span>
            </div>
            {showForecast && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#7C3AED] rounded-full" style={{ background: 'repeating-linear-gradient(45deg, #7C3AED, #7C3AED 2px, transparent 2px, transparent 4px)' }}></div>
                <span className="text-[#64748B]">Forecast</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#EF4444] rounded-full animate-pulse"></div>
              <span className="text-[#64748B]">Symptoms</span>
            </div>
          </div>
        </div>

        {/* Chart Summary with smooth transitions */}
        <div className="mt-4 p-3 lg:p-4 bg-gray-50 rounded-lg transition-all duration-300">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
            <div className="transition-all duration-300">
              <div className="text-lg lg:text-xl font-bold text-[#0A1C40]">
                {Math.round(statistics.average)}
              </div>
              <div className="text-xs text-[#64748B]">Average</div>
            </div>
            <div className="transition-all duration-300">
              <div className="text-lg lg:text-xl font-bold text-[#0A1C40]">
                {statistics.peak}
              </div>
              <div className="text-xs text-[#64748B]">Peak</div>
            </div>
            <div className="transition-all duration-300">
              <div className="text-lg lg:text-xl font-bold text-[#0A1C40]">
                {statistics.symptoms}
              </div>
              <div className="text-xs text-[#64748B]">Symptoms</div>
            </div>
            <div className="transition-all duration-300">
              <div className="text-lg lg:text-xl font-bold text-[#0A1C40]">
                {statistics.days}
              </div>
              <div className="text-xs text-[#64748B]">Days</div>
            </div>
          </div>
        </div>

        {/* Best Time Windows */}
        {statistics.bestTime && (
          <div className="mt-4 p-3 lg:p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Best Time for Outdoor Activities</span>
            </div>
            <div className="text-sm text-green-700">
              {statistics.bestTime ? `${statistics.bestTime.hour}:00 - AQI ${statistics.bestTime.value} (Lowest pollution)` : 'No data available'}
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
              className="text-xs"
            >
              {showForecast ? 'Hide Forecast' : 'Show Forecast'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
