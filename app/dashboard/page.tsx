'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from '@/contexts/LocationContext'
import { useToast } from '@/hooks/use-toast'
import { useGeolocation } from '@/hooks/useGeolocation'
import { PageLayout } from '@/components/PageLayout'
import { Navigation } from '@/components/Navigation'
import { FloatingSettingsButton } from '@/components/FloatingSettingsButton'
import { LocationPickerModal } from '@/components/LocationPickerModal'
import { EnhancedRiskCard } from '@/components/EnhancedRiskCard'
import { AIQAExplainer } from '@/components/AIQAExplainer'
import { RunCoach } from '@/components/RunCoach'
import { SymptomForm } from '@/components/SymptomForm'
import { SavedPlaces } from '@/components/SavedPlaces'
import { LLMResponseCard } from '@/components/LLMResponseCard'
import { TipsCard } from '@/components/TipsCard'
import { ExportShareButton } from '@/components/ExportShareButton'
import { apiRequest } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import { MapPin, RefreshCw, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Profile } from "@shared/schema"

export default function DashboardPage() {
  const { user: supabaseUser, signOut } = useAuth();
  const {
    selectedLocation,
    setSelectedLocation,
    requestLocationPermission,
    locationPermission,
  } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  // UI state
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Profile setup state (disabled for now)
  // const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Geolocation hook
  const {
    lat: currentLat,
    lon: currentLon,
    loading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
  } = useGeolocation();

  // Current location label
  const currentLocationLabel = selectedLocation
    ? selectedLocation.label
    : currentLat && currentLon
    ? `${currentLat.toFixed(4)}, ${currentLon.toFixed(4)}`
    : "Getting location...";

  // Air quality data - use selected location or current location or NYC fallback
  const fallbackLat = 40.7128;
  const fallbackLon = -74.006;
  const airQualityLat =
    selectedLocation?.lat ||
    (currentLat && !isNaN(currentLat) ? currentLat : fallbackLat);
  const airQualityLon =
    selectedLocation?.lon ||
    (currentLon && !isNaN(currentLon) ? currentLon : fallbackLon);

  const {
    data: airQualityData,
    isLoading: airQualityLoading,
    refetch: refetchAirQuality,
    error: airQualityError,
  } = useQuery({
    queryKey: ['air-quality', airQualityLat, airQualityLon],
    queryFn: async () => {
      const response = await fetch(
        `/api/air?lat=${airQualityLat}&lon=${airQualityLon}&userId=${supabaseUser?.id || ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch air quality data');
      }
      return response.json();
    },
    enabled: !!(airQualityLat && airQualityLon),
    retry: 1,
    retryDelay: 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Saved places data
  const {
    data: savedPlaces,
    isLoading: savedPlacesLoading,
    error: savedPlacesError,
  } = useQuery({
    queryKey: ['saved-places', supabaseUser?.id],
    queryFn: async () => {
      if (!supabaseUser?.id) return [];
      const response = await fetch(`/api/saved-places?userId=${supabaseUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved places');
      }
      return response.json();
    },
    enabled: !!supabaseUser?.id,
    retry: 1,
  });

  // Tips data
  const {
    data: tips,
    isLoading: tipsLoading,
    error: tipsError,
  } = useQuery({
    queryKey: ['tips', supabaseUser?.id],
    queryFn: async () => {
      if (!supabaseUser?.id) return [];
      const response = await fetch(`/api/tips?userId=${supabaseUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tips');
      }
      return response.json();
    },
    enabled: !!supabaseUser?.id,
    retry: 1,
  });

  // LLM response state
  const [llmResponse, setLlmResponse] = useState<any>(null);
  const [showLlmResponse, setShowLlmResponse] = useState(false);

  // Profile setup state (disabled for now)
  // const [profileSetupShown, setProfileSetupShown] = useState(false);

  // Auto-refetch air quality when location changes
  useEffect(() => {
    if (airQualityLat && airQualityLon) {
      refetchAirQuality();
    }
  }, [airQualityLat, airQualityLon, refetchAirQuality]);

  // Handle location permission request
  const handleRequestLocation = async () => {
    try {
      await requestLocationPermission();
      if (currentLat && currentLon) {
        // Get location name from coordinates
        const response = await fetch(
          `/api/location/reverse?lat=${currentLat}&lon=${currentLon}`
        );
        if (response.ok) {
          const locationData = await response.json();
          const currentLocationData = {
            lat: currentLat,
            lon: currentLon,
            label: locationData[0]?.name || `${currentLat.toFixed(4)}, ${currentLon.toFixed(4)}`,
          };
          setSelectedLocation(currentLocationData);
          setShowLocationPicker(false);
        } else {
          // Fallback to coordinates
          const currentLocationData = {
            lat: currentLat,
            lon: currentLon,
            label: `${currentLat.toFixed(4)}, ${currentLon.toFixed(4)}`,
          };
          setSelectedLocation(currentLocationData);
          setShowLocationPicker(false);
        }
      }
    } catch (error) {
      console.error('Location request failed:', error);
      toast({
        title: 'Location Access Denied',
        description: 'Please enable location access to get accurate air quality data.',
        variant: 'destructive',
      });
    }
  };

  // Handle location refresh
  const handleLocationRefresh = async () => {
    try {
      await refetchLocation();
      await refetchAirQuality();
      toast({
        title: "Location & Air Quality Refreshed",
        description: "Latest data has been fetched.",
      });
    } catch (error) {
      console.error('Location refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh location data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Profile data
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", supabaseUser?.id],
    queryFn: async () => {
      if (!supabaseUser?.id) return null;

      try {
        // First try to get existing profile
        const response = await fetch(`/api/profile/${supabaseUser.id}`);
        if (response.ok) {
          return response.json();
        }

        // If profile doesn't exist (404), create a default one
      if (response.status === 404) {
          console.log(
            "Profile not found, creating default profile for user:",
            supabaseUser.id
          );

          // Create the profile directly with Supabase user ID
          const createResponse = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: supabaseUser.id,
              displayName: supabaseUser.email?.split("@")[0] || "User",
              sensitivity: {
                asthma: false,
                pregnant: false,
                ageGroup: "adult",
                cardiopulmonary: false,
              },
            }),
          });

          if (createResponse.ok) {
        return createResponse.json();
          }
        }

        return null;
      } catch (error) {
        console.error("Profile fetch error:", error);
        return null;
      }
    },
    enabled: !!supabaseUser?.id,
    retry: 1,
    retryDelay: 1000,
  });

  // Check if profile needs setup (disabled for now)
  // const needsProfileSetup = profile && (!profile.displayName || !profile.sensitivity?.ageGroup);

  // Show profile setup modal if needed (disabled for now)
  // useEffect(() => {
  //   if (needsProfileSetup && !showProfileSetup && !profileSetupShown) {
  //     setShowProfileSetup(true);
  //   }
  // }, [needsProfileSetup, showProfileSetup, profileSetupShown]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!supabaseUser) {
      router.push('/auth');
    }
  }, [supabaseUser, router]);

  // Show loading state
  if (!supabaseUser) {
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
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#6200D9] font-bold text-sm">A</span>
                  </div>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-[#0A1C40] tracking-tight truncate">Dashboard</h1>
                  <p className="text-xs text-[#64748B] font-medium truncate">Air Quality Health</p>
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
                <h1 className="heading-1 text-[#0A1C40]">Dashboard</h1>
                <p className="body-large text-[#64748B]">Your personalized air quality health overview</p>
              </motion.div>
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                <Button
                  variant="outline"
                  onClick={handleLocationRefresh}
                  disabled={locationLoading || airQualityLoading}
                  className="flex items-center gap-2 h-11 px-4 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className={`h-4 w-4 ${locationLoading || airQualityLoading ? 'animate-spin' : ''}`} />
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
          className="px-4 lg:px-8 py-2 lg:py-8 pb-32 lg:pb-12"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Location Picker */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full flex items-center justify-between h-12 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 rounded-xl group"
                  >
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 bg-[#6200D9] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      >
                        <MapPin className="h-5 w-5 text-white" />
                      </motion.div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {currentLocationLabel}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to change location</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-[#6200D9] text-white text-sm font-medium rounded-lg"
                      >
                        Selected
                      </motion.span>
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </motion.button>
                </motion.div>

                {/* Location Picker Modal */}
                <LocationPickerModal
                  isOpen={showLocationPicker}
                  onClose={() => setShowLocationPicker(false)}
                  onLocationSelect={(location, airQuality) => {
                    setSelectedLocation(location);
                    setShowLocationPicker(false);
                  }}
                  currentLocation={selectedLocation || undefined}
                  onUseCurrentLocation={async () => {
                    if (currentLat && currentLon) {
                      // Get location name from coordinates
                      const response = await fetch(
                        `/api/location/reverse?lat=${currentLat}&lon=${currentLon}`
                      );
                      if (response.ok) {
                        const locationData = await response.json();
                        const currentLocationData = {
                          lat: currentLat,
                          lon: currentLon,
                          label: locationData[0]?.name || `${currentLat.toFixed(4)}, ${currentLon.toFixed(4)}`,
                        };
                        setSelectedLocation(currentLocationData);
                        setShowLocationPicker(false);
                      } else {
                        // Fallback to coordinates
                        const currentLocationData = {
                          lat: currentLat,
                          lon: currentLon,
                          label: `${currentLat.toFixed(4)}, ${currentLon.toFixed(4)}`,
                        };
                        setSelectedLocation(currentLocationData);
                        setShowLocationPicker(false);
                      }
                    } else {
                      // Request location permission if not available
                      await requestLocationPermission();
                      setShowLocationPicker(false);
                    }
                  }}
                  isCurrentLocationLoading={locationLoading}
                  userId={supabaseUser?.id}
                />

                {/* Enhanced Air Quality Risk Card */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <EnhancedRiskCard
                    aqi={airQualityData?.aqi || 0}
                    category={airQualityData?.category || 'Unknown'}
                    dominantPollutant={airQualityData?.dominantPollutant || 'PM2.5'}
                    previousAqi={airQualityData?.previousAqi}
                    pm25={airQualityData?.pm25}
                    pm10={airQualityData?.pm10}
                    o3={airQualityData?.o3}
                    no2={airQualityData?.no2}
                    className="shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </motion.div>

                {/* AI QA Explainer */}
                <AnimatePresence>
                  {airQualityData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <AIQAExplainer
                        currentAqi={airQualityData.aqi}
                        dominantPollutant={airQualityData.dominantPollutant}
                        category={airQualityData.category}
                        userId={supabaseUser?.id || ''}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Run Coach */}
                <AnimatePresence>
                  {airQualityData && selectedLocation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <RunCoach
                        currentAqi={airQualityData.aqi}
                        currentLocation={selectedLocation}
                        savedPlaces={savedPlaces || []}
                        forecastData={[]} // TODO: Add forecast data
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Symptom Form */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="bg-white rounded-2xl p-5 lg:p-8 shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300"
                >
                  <h3 className="text-lg lg:text-xl font-bold text-[#0A1C40] mb-5 lg:mb-6 tracking-tight">
                    Log Symptoms
                  </h3>
                  <SymptomForm
                    userId={supabaseUser?.id}
                    profile={profile}
                    airData={airQualityData}
                    onSymptomLogged={setLlmResponse}
                    embedded
                  />
                </motion.div>
              </div>

              {/* Right Column - Sidebar */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="space-y-6"
              >
                {/* Saved Places */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <SavedPlaces
                    userId={supabaseUser?.id || ""}
                    onLocationSelect={(location) => {
                      setSelectedLocation(location);
                      setShowLocationPicker(false);
                    }}
                  />
                </motion.div>

                {/* AI Health Insights */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <LLMResponseCard
                    response={llmResponse}
                    isVisible={showLlmResponse}
                  />
                </motion.div>

                {/* Personalized Health Tips */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <TipsCard tips={tips || []} className="mt-6" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Export/Share Button - Desktop Only */}
        <AnimatePresence>
          {airQualityData && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
              className="hidden lg:block"
            >
              <ExportShareButton
                airQualityData={{
                  aqi: airQualityData.aqi,
                  category: airQualityData.category,
                  dominantPollutant: airQualityData.dominantPollutant,
                  location: selectedLocation?.label || 'Unknown Location',
                  timestamp: airQualityData.timestamp || new Date().toISOString()
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>


        {/* Navigation */}
        <Navigation />
        
        {/* Floating Settings Button */}
        <FloatingSettingsButton />
      </div>
    </PageLayout>
  );
}