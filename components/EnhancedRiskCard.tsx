'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from 'recharts';

interface EnhancedRiskCardProps {
  aqi: number;
  category: string;
  dominantPollutant: string;
  previousAqi?: number;
  className?: string;
  // Detailed pollutant data
  pm25?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
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

// Pollutant health levels based on WHO guidelines
const POLLUTANT_LEVELS = {
  'PM2.5': [
    { min: 0, max: 15, level: 'Good', color: 'text-green-600', bgColor: 'bg-green-50' },
    { min: 15, max: 25, level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { min: 25, max: 50, level: 'Unhealthy for Sensitive', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { min: 50, max: 75, level: 'Unhealthy', color: 'text-red-600', bgColor: 'bg-red-50' },
    { min: 75, max: 100, level: 'Very Unhealthy', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { min: 100, max: Infinity, level: 'Hazardous', color: 'text-red-800', bgColor: 'bg-red-100' }
  ],
  'PM10': [
    { min: 0, max: 30, level: 'Good', color: 'text-green-600', bgColor: 'bg-green-50' },
    { min: 30, max: 50, level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { min: 50, max: 100, level: 'Unhealthy for Sensitive', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { min: 100, max: 150, level: 'Unhealthy', color: 'text-red-600', bgColor: 'bg-red-50' },
    { min: 150, max: 200, level: 'Very Unhealthy', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { min: 200, max: Infinity, level: 'Hazardous', color: 'text-red-800', bgColor: 'bg-red-100' }
  ],
  'O3': [
    { min: 0, max: 50, level: 'Good', color: 'text-green-600', bgColor: 'bg-green-50' },
    { min: 50, max: 100, level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { min: 100, max: 150, level: 'Unhealthy for Sensitive', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { min: 150, max: 200, level: 'Unhealthy', color: 'text-red-600', bgColor: 'bg-red-50' },
    { min: 200, max: 300, level: 'Very Unhealthy', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { min: 300, max: Infinity, level: 'Hazardous', color: 'text-red-800', bgColor: 'bg-red-100' }
  ],
  'NO2': [
    { min: 0, max: 40, level: 'Good', color: 'text-green-600', bgColor: 'bg-green-50' },
    { min: 40, max: 80, level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { min: 80, max: 150, level: 'Unhealthy for Sensitive', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { min: 150, max: 200, level: 'Unhealthy', color: 'text-red-600', bgColor: 'bg-red-50' },
    { min: 200, max: 300, level: 'Very Unhealthy', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { min: 300, max: Infinity, level: 'Hazardous', color: 'text-red-800', bgColor: 'bg-red-100' }
  ]
};

// Get pollutant health level
const getPollutantLevel = (pollutant: string, value: number) => {
  const levels = POLLUTANT_LEVELS[pollutant as keyof typeof POLLUTANT_LEVELS];
  if (!levels) return { level: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  
  const level = levels.find(l => value >= l.min && value < l.max) || levels[levels.length - 1];
  return level;
};

// Enhanced Visual Gauge Component
function VisualGauge({ 
  value, 
  maxValue, 
  color, 
  size = 80,
  label,
  healthLevel
}: { 
  value: number; 
  maxValue: number; 
  color: string; 
  size?: number;
  label: string;
  healthLevel: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  // Create data for the gauge with multiple segments
  const data = [
    { name: 'value', value: percentage, fill: color },
    { name: 'background', value: 100, fill: '#f1f5f9' }
  ];

  // Get color based on percentage
  const getGaugeColor = (percentage: number) => {
    if (percentage <= 25) return '#10B981'; // Green
    if (percentage <= 50) return '#F59E0B'; // Yellow
    if (percentage <= 75) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const gaugeColor = getGaugeColor(percentage);

  useEffect(() => {
    // Reset and start animation
    setIsLoaded(false);
    setAnimatedValue(0);
    
    // Animate the gauge
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const stepSize = value / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newValue = stepSize * currentStep;
      setAnimatedValue(newValue);
      
      if (currentStep >= steps) {
        setAnimatedValue(value);
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      {/* Enhanced gradient background with multiple layers */}
      <div 
        className="absolute rounded-full opacity-20"
        style={{
          width: size * 1.1,
          height: size * 1.1,
          background: `radial-gradient(circle, ${gaugeColor} 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}
      />
      
      {/* Secondary gradient layer */}
      <div 
        className="absolute rounded-full opacity-10"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: `radial-gradient(circle, ${gaugeColor} 0%, transparent 60%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}
      />
      
      {/* Recharts Gauge with enhanced styling */}
      <div className="relative z-10" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="95%"
            startAngle={180}
            endAngle={0}
            data={data}
            className="drop-shadow-lg"
          >
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              fill={gaugeColor}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
              }}
            />
            <RadialBar
              dataKey="background"
              fill="#f1f5f9"
              className="opacity-40"
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Center content with enhanced styling */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0.3, 
            scale: isLoaded ? 1 : 0.8 
          }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-center"
        >
          <div className={`text-xl font-bold ${color} transition-all duration-300 drop-shadow-sm`}>
            {animatedValue.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-500 font-medium tracking-wide">
            μg/m³
          </div>
        </motion.div>
      </div>
      
      {/* Health level indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          y: isLoaded ? 0 : 10 
        }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getPollutantLevel(label, value).bgColor} ${getPollutantLevel(label, value).color} shadow-sm`}>
          {healthLevel}
        </div>
      </motion.div>
      
      {/* Loading indicator */}
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center z-30"
        >
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      )}
    </div>
  );
}

export function EnhancedRiskCard({ 
  aqi, 
  category, 
  dominantPollutant, 
  previousAqi,
  pm25,
  pm10,
  o3,
  no2,
  className = '' 
}: EnhancedRiskCardProps) {
  const [animatedAqi, setAnimatedAqi] = useState(previousAqi || aqi);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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


  // Check if we have detailed pollutant data
  const hasDetailedData = pm25 !== undefined || pm10 !== undefined || o3 !== undefined || no2 !== undefined;

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

          {/* View Details Button - Only show if we have detailed data */}
          {hasDetailedData && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <motion.div
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
                {showDetails ? 'Hide Details' : 'View Details'}
              </Button>
            </div>
          )}

          {/* Detailed Pollutant Data with smooth slide animation */}
          <AnimatePresence>
            {showDetails && hasDetailedData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: "easeInOut",
                  opacity: { duration: 0.2 }
                }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-lg"
                >
                  <h4 className="text-sm font-semibold text-[#0A1C40] mb-4 text-center">Individual Pollutant Levels</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {pm25 !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="p-4 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-center mb-3">
                          <span className="text-sm font-bold text-gray-800">PM2.5</span>
                        </div>
                        <div className="flex justify-center mb-3">
                          <VisualGauge
                            value={pm25}
                            maxValue={100}
                            color="text-blue-500"
                            size={72}
                            label="PM2.5"
                            healthLevel={getPollutantLevel('PM2.5', pm25).level}
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    {pm10 !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="p-4 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-center mb-3">
                          <span className="text-sm font-bold text-gray-800">PM10</span>
                        </div>
                        <div className="flex justify-center mb-3">
                          <VisualGauge
                            value={pm10}
                            maxValue={200}
                            color="text-green-500"
                            size={72}
                            label="PM10"
                            healthLevel={getPollutantLevel('PM10', pm10).level}
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    {o3 !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="p-4 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-center mb-3">
                          <span className="text-sm font-bold text-gray-800">O₃</span>
                        </div>
                        <div className="flex justify-center mb-3">
                          <VisualGauge
                            value={o3}
                            maxValue={200}
                            color="text-yellow-500"
                            size={72}
                            label="O3"
                            healthLevel={getPollutantLevel('O3', o3).level}
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    {no2 !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="p-4 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-center mb-3">
                          <span className="text-sm font-bold text-gray-800">NO₂</span>
                        </div>
                        <div className="flex justify-center mb-3">
                          <VisualGauge
                            value={no2}
                            maxValue={200}
                            color="text-red-500"
                            size={72}
                            label="NO2"
                            healthLevel={getPollutantLevel('NO2', no2).level}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="mt-4 text-[10px] text-gray-500 text-center"
                  >
                    Values based on WHO air quality guidelines
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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