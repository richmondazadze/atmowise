'use client'

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, MapPin, Calendar, Activity, RefreshCw, Download, Filter, Wind, AlertCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PageLayout } from '@/components/PageLayout';
import { EnhancedTimelineChart } from '@/components/EnhancedTimelineChart';
import { useToast } from '@/hooks/use-toast';

interface TimelineData {
  id: string;
  date: string;
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  category: string;
  location: string;
  source: string;
  createdAt: string;
}

export default function TimelinePage() {
  const { user } = useAuth();
  const { selectedLocation } = useLocation();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('aqi');

  // Convert period to days
  const getDaysFromPeriod = (period: string) => {
    switch (period) {
      case '1d': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  // Fetch historical air quality data
  const { data: timelineResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['timeline-data', user?.id, selectedPeriod, selectedLocation?.lat, selectedLocation?.lon],
    queryFn: async () => {
      if (!user?.id || !selectedLocation) {
        return { data: [], period: 0, totalReadings: 0, location: null };
      }

      const days = getDaysFromPeriod(selectedPeriod);
      const url = `/api/air/history?userId=${user.id}&days=${days}&lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch timeline data: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!user?.id && !!selectedLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const timelineData: TimelineData[] = timelineResponse?.data || [];

  const periods = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  const metrics = [
    { value: 'aqi', label: 'AQI' },
    { value: 'pm25', label: 'PM2.5' },
    { value: 'pm10', label: 'PM10' },
    { value: 'o3', label: 'O₃' },
    { value: 'no2', label: 'NO₂' },
  ];

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-800';
  };

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Calculate stats from real data
  const stats = timelineData.length > 0 ? {
    averageAQI: Math.round(timelineData.reduce((sum, item) => sum + item.aqi, 0) / timelineData.length),
    bestDay: timelineData.reduce((min, item) => item.aqi < min.aqi ? item : min, timelineData[0]),
    worstDay: timelineData.reduce((max, item) => item.aqi > max.aqi ? item : max, timelineData[0]),
    totalReadings: timelineData.length
  } : {
    averageAQI: 0,
    bestDay: { aqi: 0, date: '', time: '' },
    worstDay: { aqi: 0, date: '', time: '' },
    totalReadings: 0
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Timeline refreshed",
      description: "Latest air quality data has been loaded.",
    });
  };

  // Handle export
  const handleExport = () => {
    if (timelineData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please select a location and period with data.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Date', 'Time', 'AQI', 'PM2.5', 'PM10', 'O3', 'NO2', 'Category', 'Source'],
      ...timelineData.map(item => [
        item.date,
        item.time,
        item.aqi,
        item.pm25,
        item.pm10,
        item.o3,
        item.no2,
        item.category,
        item.source
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atmowise-timeline-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Timeline data has been downloaded as CSV.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6200D9] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Please sign in to view your timeline</p>
        </div>
      </div>
    );
  }

  if (!selectedLocation) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <MapPin className="h-16 w-16 text-[#64748B] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0A1C40] mb-2">No Location Selected</h2>
            <p className="text-[#64748B] mb-6">Please select a location from the Dashboard to view your air quality timeline.</p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-[#6200D9] hover:bg-[#4C00A8] text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
        <Navigation />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Mobile Header - Premium Design */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#6200D9] via-[#7C3AED] to-[#4C00A8] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <TrendingUp className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0A1C40] tracking-tight">Timeline</h1>
                <p className="text-xs text-[#64748B] font-medium">Air Quality History</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-30 header-premium">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 text-[#0A1C40]">Timeline</h1>
              <p className="body-large text-[#64748B]">Track your air quality history and trends</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <div className="px-4 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-8">
        {/* Controls - Mobile Optimized */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col gap-4">
            {/* Period Selection - Mobile First */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap touch-target ${
                    selectedPeriod === period.value
                      ? 'bg-gradient-to-r from-[#6200D9] to-[#7C3AED] text-white shadow-lg'
                      : 'bg-white text-[#64748B] hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            {/* Action Buttons - Mobile Optimized */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-28 h-10 border-gray-200 rounded-xl text-sm font-medium">
                  <SelectValue placeholder="AQI" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-10 px-3 border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium touch-target"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                disabled={timelineData.length === 0}
                className="h-10 px-3 border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium touch-target"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#71E07E] to-[#5BCB6B] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <Activity className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-[#64748B] font-semibold">Average AQI</p>
                <p className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{stats.averageAQI}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#BA5FFF] to-[#A847E6] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <TrendingUp className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-[#64748B] font-semibold">Best Day</p>
                <p className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{stats.bestDay.aqi}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <Activity className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-[#64748B] font-semibold">Worst Day</p>
                <p className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{stats.worstDay.aqi}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6200D9] via-[#7C3AED] to-[#4C00A8] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <Wind className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-[#64748B] font-semibold">Total Readings</p>
                <p className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{stats.totalReadings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/50">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6200D9] mr-3"></div>
              <p className="text-[#64748B]">Loading timeline data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100/50">
            <div className="flex items-center justify-center text-center">
              <div>
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#0A1C40] mb-2">Failed to Load Data</h3>
                <p className="text-[#64748B] mb-4">Unable to fetch timeline data. Please try again.</p>
                <Button onClick={handleRefresh} className="bg-[#6200D9] hover:bg-[#4C00A8] text-white">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && timelineData.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/50">
            <div className="flex items-center justify-center text-center">
              <div>
                <TrendingUp className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#0A1C40] mb-2">No Data Available</h3>
                <p className="text-[#64748B] mb-4">
                  No air quality data found for the selected period. 
                  Data will appear here as you check air quality from the Dashboard.
                </p>
                <Button 
                  onClick={() => window.history.back()}
                  className="bg-[#6200D9] hover:bg-[#4C00A8] text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Chart */}
        {!isLoading && !error && timelineData.length > 0 && (
          <EnhancedTimelineChart
            airData={timelineData}
            symptomData={[]} // No symptom data for now
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            forecastData={[]} // TODO: Add forecast data
          />
        )}

        {/* Timeline List - Mobile Optimized */}
        {!isLoading && !error && timelineData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 lg:p-8 shadow-sm border border-gray-100/50">
            <div className="flex items-center justify-between mb-5 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">Recent Readings</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[#64748B] font-medium">
                  {selectedLocation.label}
                </span>
                <Badge variant="outline" className="text-xs">
                  {timelineResponse?.totalReadings || 0} readings
                </Badge>
              </div>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {timelineData.slice(0, 10).map((reading) => (
                <div key={reading.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200/50 transition-all duration-200 touch-target">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getAQIColor(reading.aqi)} shadow-sm flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm lg:text-base text-[#0A1C40] font-bold truncate">
                        {new Date(reading.date).toLocaleDateString()} at {reading.time}
                      </p>
                      <p className="text-xs lg:text-sm text-[#64748B] font-medium truncate">
                        {reading.location} • {reading.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg lg:text-xl text-[#0A1C40] font-bold tracking-tight">{reading.aqi}</p>
                      <p className="text-xs lg:text-sm text-[#64748B] font-semibold">{getAQILabel(reading.aqi)}</p>
                    </div>
                    <Badge className={`${getAQIColor(reading.aqi)} text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm`}>
                      {reading.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Navigation />
    </PageLayout>
  );
}