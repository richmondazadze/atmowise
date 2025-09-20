'use client'

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Activity, Download } from "lucide-react";

interface TimelineChartProps {
  airData: any[];
  symptomData: any[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export function TimelineChart({ 
  airData, 
  symptomData, 
  selectedMetric, 
  onMetricChange,
  selectedPeriod,
  onPeriodChange 
}: TimelineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Use real data from props
  const chartData = airData || [];
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d[selectedMetric as keyof typeof d] as number || 0)) : 100;

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#71E07E';
    if (aqi <= 100) return '#F59E0B';
    if (aqi <= 150) return '#EF4444';
    return '#DC2626';
  };

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
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedMetric} onValueChange={onMetricChange}>
              <SelectTrigger className="w-24 lg:w-32 text-xs lg:text-sm border-[#E2E8F0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
        <div className="h-48 lg:h-64 relative">
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
            
            {/* Data line */}
            <polyline
              fill="none"
              stroke="#6200D9"
              strokeWidth="2"
              points={chartData.map((d, i) => {
                // Safe calculation to prevent NaN when chartData.length is 1
                const x = chartData.length === 1 ? 40 + 170 : 40 + (i / Math.max(chartData.length - 1, 1)) * 340;
                const value = d[selectedMetric as keyof typeof d] as number || 0;
                const y = 170 - ((value / Math.max(maxValue, 1)) * 120);
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {chartData.map((d, i) => {
              // Safe calculation to prevent NaN when chartData.length is 1
              const x = chartData.length === 1 ? 40 + 170 : 40 + (i / Math.max(chartData.length - 1, 1)) * 340;
              const value = d[selectedMetric as keyof typeof d] as number || 0;
              const y = 170 - ((value / Math.max(maxValue, 1)) * 120);
              
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#6200D9"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                  {d.symptom && (
                    <circle
                      cx={x}
                      cy={180}
                      r="3"
                      fill="#EF4444"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}
            
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
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#EF4444] rounded-full animate-pulse"></div>
              <span className="text-[#64748B]">Symptoms</span>
            </div>
          </div>
        </div>

        {/* Chart Summary */}
        <div className="mt-4 p-3 lg:p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg lg:text-xl font-bold text-[#0A1C40]">
                {Math.round(chartData.reduce((sum, d) => sum + (d[selectedMetric as keyof typeof d] as number || 0), 0) / chartData.length)}
              </div>
              <div className="text-xs text-[#64748B]">Average</div>
            </div>
            <div>
              <div className="text-lg lg:text-xl font-bold text-[#0A1C40]">
                {Math.max(...chartData.map(d => d[selectedMetric as keyof typeof d] as number || 0))}
              </div>
              <div className="text-xs text-[#64748B]">Peak</div>
            </div>
            <div>
              <div className="text-lg lg:text-xl font-bold text-[#0A1C40]">
                {chartData.filter(d => d.symptom).length}
              </div>
              <div className="text-xs text-[#64748B]">Symptoms</div>
            </div>
            <div>
              <div className="text-lg lg:text-xl font-bold text-[#0A1C40]">
                {chartData.length}
              </div>
              <div className="text-xs text-[#64748B]">Days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}