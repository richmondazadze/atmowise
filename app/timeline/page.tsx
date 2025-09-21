'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { PageLayout } from '@/components/PageLayout'
import { Navigation } from '@/components/Navigation'
import { FloatingSettingsButton } from '@/components/FloatingSettingsButton'
import { EnhancedTimelineChart } from '@/components/EnhancedTimelineChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Calendar, MapPin, RefreshCw, Download, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AirQualityReading {
  id: string
  aqi: number
  category: string
  dominantPollutant: string
  pm25?: number
  pm10?: number
  o3?: number
  no2?: number
  timestamp: string
  location?: string
}

export default function TimelinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // Fetch air quality history
  const {
    data: airQualityHistory,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['air-quality-history', selectedPeriod, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/api/air/history?period=${selectedPeriod}&userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch air quality history');
      }
      return response.json();
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchHistory();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle export
  const handleExport = () => {
    if (!airQualityHistory || airQualityHistory.length === 0) return;
    
    const csvContent = [
      ['Date', 'AQI', 'Category', 'Dominant Pollutant', 'PM2.5', 'PM10', 'O3', 'NO2', 'Location'],
      ...airQualityHistory.map((reading: AirQualityReading) => [
        new Date(reading.timestamp).toLocaleDateString(),
        reading.aqi,
        reading.category,
        reading.dominantPollutant,
        reading.pm25 || '',
        reading.pm10 || '',
        reading.o3 || '',
        reading.no2 || '',
        reading.location || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `air-quality-timeline-${selectedPeriod}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Show loading state
  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-12 h-12 bg-[#6200D9] rounded-lg flex items-center justify-center mx-auto mb-4"
          >
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300"
          >
            Loading...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Mobile Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 py-4 mb-6"
        >
          <div className="px-4">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center space-x-3 min-w-0 flex-1"
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-11 h-11 bg-gradient-to-br from-[#6200D9] via-[#7C3AED] to-[#4C00A8] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20 flex-shrink-0"
                >
                  <TrendingUp className="h-5 w-5 text-white drop-shadow-sm" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-[#0A1C40] tracking-tight truncate">
                    Timeline
                  </h1>
                  <p className="text-xs text-[#64748B] font-medium truncate">
                    Air Quality History
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Desktop Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="hidden lg:block sticky top-0 z-30 header-premium"
        >
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h1 className="heading-1 text-[#0A1C40]">Timeline</h1>
                <p className="body-large text-[#64748B]">
                  Track your air quality history and trends
                </p>
              </motion.div>
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 h-11 px-4 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-4 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-8"
        >
          <div className="max-w-7xl mx-auto">
            {/* Controls */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mb-6"
            >
              <Card className="p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Time Period:</span>
                    <div className="flex gap-2">
                      {(['7d', '30d', '90d'] as const).map((period) => (
                        <Button
                          key={period}
                          variant={selectedPeriod === period ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedPeriod(period)}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={!airQualityHistory || airQualityHistory.length === 0}
                      className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Timeline Chart */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mb-6"
            >
              <Card className="p-6 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#6200D9]" />
                    Air Quality Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-[#6200D9] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-600">Loading timeline data...</p>
                      </div>
                    </div>
                  ) : historyError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-4">Failed to load timeline data</p>
                      <Button onClick={handleRefresh} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  ) : !airQualityHistory || airQualityHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No data available for this period</p>
                      <p className="text-sm text-gray-500">Check back later or try a different time period</p>
                    </div>
                  ) : (
                    <EnhancedTimelineChart data={airQualityHistory} />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Readings */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#6200D9]" />
                    Recent Readings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : historyError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">Failed to load recent readings</p>
                    </div>
                  ) : !airQualityHistory || airQualityHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No recent readings available</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <div className="space-y-3">
                        {airQualityHistory.slice(0, 20).map((reading: AirQualityReading, index: number) => {
                          const aqiInfo = getAQIInfo(reading.aqi);
                          return (
                            <motion.div
                              key={reading.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${aqiInfo.bgColor}`}>
                                  <span className={`text-lg font-bold ${aqiInfo.textColor}`}>
                                    {reading.aqi}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">
                                      {new Date(reading.timestamp).toLocaleDateString()}
                                    </span>
                                    <Badge className={`${aqiInfo.bgColor} ${aqiInfo.textColor} text-xs`}>
                                      {reading.category}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    <span>{reading.location || 'Unknown Location'}</span>
                                    <span>•</span>
                                    <span>{reading.dominantPollutant}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">
                                  {new Date(reading.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation */}
        <Navigation />
        
        {/* Floating Settings Button */}
        <FloatingSettingsButton />
      </div>
    </PageLayout>
  );
}

// Helper function to get AQI info
function getAQIInfo(aqi: number) {
  if (aqi <= 50) {
    return { 
      category: 'Good', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    };
  } else if (aqi <= 100) {
    return { 
      category: 'Moderate', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    };
  } else if (aqi <= 150) {
    return { 
      category: 'Unhealthy for Sensitive Groups', 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    };
  } else if (aqi <= 200) {
    return { 
      category: 'Unhealthy', 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    };
  } else if (aqi <= 300) {
    return { 
      category: 'Very Unhealthy', 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    };
  } else {
    return { 
      category: 'Hazardous', 
      color: 'text-red-800', 
      bgColor: 'bg-red-100',
      textColor: 'text-red-900'
    };
  }
}