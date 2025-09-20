'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wind, Zap, Cloud } from "lucide-react";

interface PollutantGaugeProps {
  value: number | null;
  type: 'PM2.5' | 'PM10' | 'O3' | 'NO2';
  unit: string;
  threshold: number;
  className?: string;
}

export function PollutantGauge({ value, type, unit, threshold, className = "" }: PollutantGaugeProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'PM2.5': return <Activity className="h-4 w-4" />;
      case 'PM10': return <Wind className="h-4 w-4" />;
      case 'O3': return <Zap className="h-4 w-4" />;
      case 'NO2': return <Cloud className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getColor = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.5) return 'text-green-600';
    if (ratio <= 0.75) return 'text-yellow-500';
    if (ratio <= 1.0) return 'text-orange-500';
    return 'text-red-600';
  };

  const getBackgroundColor = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.5) return 'bg-green-50 border-green-200';
    if (ratio <= 0.75) return 'bg-yellow-50 border-yellow-200';
    if (ratio <= 1.0) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatus = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.5) return 'Good';
    if (ratio <= 0.75) return 'Moderate';
    if (ratio <= 1.0) return 'Poor';
    return 'Unhealthy';
  };

  const getStatusColor = (value: number, threshold: number) => {
    const ratio = value / threshold;
    if (ratio <= 0.5) return 'bg-green-100 text-green-800';
    if (ratio <= 0.75) return 'bg-yellow-100 text-yellow-800';
    if (ratio <= 1.0) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const displayValue = value !== null ? value.toFixed(2) : 'N/A';
  const ratio = value !== null ? Math.min(value / threshold, 1.5) : 0;
  const percentage = Math.min(ratio * 100, 100);

  return (
    <Card className={`${getBackgroundColor(value || 0, threshold)} border-2 transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {getIcon(type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{type}</h3>
              <p className="text-xs text-gray-600">{unit}</p>
            </div>
          </div>
          <Badge className={`text-xs font-medium ${getStatusColor(value || 0, threshold)}`}>
            {getStatus(value || 0, threshold)}
          </Badge>
        </div>

        {/* Gauge Visualization */}
        <div className="relative mb-4">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full gauge-fill ${
                ratio <= 0.5 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                ratio <= 0.75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                ratio <= 1.0 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Threshold markers */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0</span>
            <span className="font-medium">{threshold}</span>
            <span>{Math.round(threshold * 1.5)}</span>
          </div>
        </div>

        {/* Value Display */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getColor(value || 0, threshold)} mb-1`}>
            {displayValue}
          </div>
          <div className="text-xs text-gray-600">
            {value !== null ? `${Math.round(ratio * 100)}% of threshold` : 'No data'}
          </div>
        </div>

        {/* Health Impact */}
        <div className="mt-3 text-xs text-gray-600 text-center">
          {value !== null && (
            <div>
              {ratio <= 0.5 && "✅ Safe for all activities"}
              {ratio > 0.5 && ratio <= 0.75 && "⚠️ Sensitive groups should limit outdoor activities"}
              {ratio > 0.75 && ratio <= 1.0 && "⚠️ Everyone should limit outdoor activities"}
              {ratio > 1.0 && "🚨 Avoid outdoor activities"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
