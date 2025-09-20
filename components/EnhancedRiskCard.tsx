'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle } from 'lucide-react';

interface EnhancedRiskCardProps {
  aqi: number;
  category: string;
  dominantPollutant: string;
  previousAqi?: number;
  className?: string;
}

const AQI_SCALE = [
  { min: 0, max: 50, label: 'Good', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
  { min: 51, max: 100, label: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
  { min: 151, max: 200, label: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  { min: 201, max: 300, label: 'Very Unhealthy', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
  { min: 301, max: 500, label: 'Hazardous', color: 'bg-red-800', textColor: 'text-red-900', bgColor: 'bg-red-100' }
];

const POLLUTANT_INFO = {
  'PM2.5': 'Fine particulate matter that can penetrate deep into the lungs',
  'PM10': 'Coarse particulate matter that can irritate the eyes, nose, and throat',
  'O3': 'Ground-level ozone that can cause breathing problems',
  'NO2': 'Nitrogen dioxide that can irritate the respiratory system',
  'CO': 'Carbon monoxide that reduces oxygen delivery to the body',
  'SO2': 'Sulfur dioxide that can cause breathing problems'
};

export function EnhancedRiskCard({ 
  aqi, 
  category, 
  dominantPollutant, 
  previousAqi,
  className = '' 
}: EnhancedRiskCardProps) {
  const [animatedAqi, setAnimatedAqi] = useState(previousAqi || aqi);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get AQI scale info
  const aqiInfo = AQI_SCALE.find(scale => aqi >= scale.min && aqi <= scale.max) || AQI_SCALE[0];
  
  // Calculate change from previous AQI
  const change = previousAqi ? aqi - previousAqi : 0;
  const changePercent = previousAqi ? Math.round((change / previousAqi) * 100) : 0;

  // Animate AQI change
  useEffect(() => {
    if (previousAqi && previousAqi !== aqi) {
      setIsAnimating(true);
      const startAqi = previousAqi;
      const endAqi = aqi;
      const duration = 1000; // 1 second
      const steps = 30;
      const stepDuration = duration / steps;
      const stepSize = (endAqi - startAqi) / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const newAqi = startAqi + (stepSize * currentStep);
        setAnimatedAqi(Math.round(newAqi));
        
        if (currentStep >= steps) {
          setAnimatedAqi(endAqi);
          setIsAnimating(false);
          clearInterval(interval);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    } else {
      setAnimatedAqi(aqi);
    }
  }, [aqi, previousAqi]);

  // Get change icon
  const getChangeIcon = () => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  // Get change color
  const getChangeColor = () => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <TooltipProvider>
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}>
        {/* Animated background bar */}
        <div className={`absolute top-0 left-0 h-1 ${aqiInfo.color} transition-all duration-1000 ${isAnimating ? 'animate-pulse' : ''}`} 
             style={{ width: `${Math.min((aqi / 500) * 100, 100)}%` }} />
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-[#0A1C40] flex items-center gap-2">
              Air Quality Index
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    The Air Quality Index (AQI) is a scale from 0-500 that indicates how clean or polluted the air is. 
                    Higher values mean greater health concerns.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            
            {/* Change indicator */}
            {previousAqi && (
              <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()}
                <span>{Math.abs(changePercent)}%</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* AQI Value with animation */}
          <div className="text-center">
            <div className={`text-6xl font-bold transition-all duration-1000 ${isAnimating ? 'scale-110' : 'scale-100'} ${aqiInfo.textColor}`}>
              {animatedAqi}
            </div>
            <div className={`text-lg font-semibold ${aqiInfo.textColor} transition-colors duration-300`}>
              {aqiInfo.label}
            </div>
          </div>

          {/* Colored bar showing AQI level */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>300</span>
              <span>500</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${aqiInfo.color} transition-all duration-1000 ${isAnimating ? 'animate-pulse' : ''}`}
                style={{ width: `${Math.min((aqi / 500) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Dominant Pollutant */}
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  className={`${aqiInfo.bgColor} ${aqiInfo.textColor} border-current px-4 py-2 text-sm font-medium cursor-help hover:scale-105 transition-transform`}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {dominantPollutant}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  <strong>Dominant Pollutant:</strong> {dominantPollutant}
                  <br />
                  <br />
                  {POLLUTANT_INFO[dominantPollutant as keyof typeof POLLUTANT_INFO] || 'Primary air pollutant affecting air quality.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Health Recommendations */}
          <div className="text-center">
            <div className="text-sm text-gray-600">
              {aqi <= 50 && "Great air quality! Perfect for outdoor activities."}
              {aqi > 50 && aqi <= 100 && "Moderate air quality. Sensitive individuals should limit outdoor activities."}
              {aqi > 100 && aqi <= 150 && "Unhealthy for sensitive groups. Consider reducing outdoor activities."}
              {aqi > 150 && aqi <= 200 && "Unhealthy air quality. Avoid outdoor activities if possible."}
              {aqi > 200 && aqi <= 300 && "Very unhealthy air quality. Stay indoors with windows closed."}
              {aqi > 300 && "Hazardous air quality. Avoid all outdoor activities."}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

