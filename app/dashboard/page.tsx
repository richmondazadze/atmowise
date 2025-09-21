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
import { MapPin, RefreshCw } from 'lucide-react'
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
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#6200D9] rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      {/* Mobile Header - Premium Design */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-11 h-11 bg-gradient-to-br from-[#6200D9] via-[#7C3AED] to-[#4C00A8] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20 flex-shrink-0">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#6200D9] font-bold text-sm">A</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-[#0A1C40] tracking-tight truncate">Dashboard</h1>
                <p className="text-xs text-[#64748B] font-medium truncate">Air Quality Health</p>
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
              <h1 className="heading-1 text-[#0A1C40]">Dashboard</h1>
              <p className="body-large text-[#64748B]">Your personalized air quality health overview</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowLocationPicker(true)}
                className="flex items-center gap-2 h-9 px-4 text-sm"
              >
                <MapPin className="h-4 w-4" />
                {selectedLocation ? selectedLocation.label : "Select Location"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLocationRefresh}
                disabled={locationLoading || airQualityLoading}
                className="flex items-center gap-2 h-9 px-4 text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${locationLoading || airQualityLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <div className="px-4 lg:px-8 py-2 lg:py-8 pb-32 lg:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content - Mobile Optimized */}
            <div className="lg:col-span-2 space-y-6">
              {/* Location Picker - Mobile & Desktop */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-4">
                <button
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-[#6200D9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs">📍</span>
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {currentLocationLabel}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Click to change location</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-[#6200D9] text-white text-xs font-medium rounded-full">
                      Selected
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              </div>

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
              <EnhancedRiskCard
                aqi={airQualityData?.aqi || 0}
                category={airQualityData?.category || 'Unknown'}
                dominantPollutant={airQualityData?.dominantPollutant || 'PM2.5'}
                previousAqi={airQualityData?.previousAqi}
                className="animate-fade-in"
              />

              {/* AI QA Explainer */}
              {airQualityData && (
                <AIQAExplainer
                  currentAqi={airQualityData.aqi}
                  dominantPollutant={airQualityData.dominantPollutant}
                  category={airQualityData.category}
                  userId={supabaseUser?.id || ''}
                />
              )}

              {/* Run Coach */}
              {airQualityData && selectedLocation && (
                <RunCoach
                  currentAqi={airQualityData.aqi}
                  currentLocation={selectedLocation}
                  savedPlaces={savedPlaces || []}
                  forecastData={[]} // TODO: Add forecast data
                />
              )}


              {/* Symptom Form - Mobile Optimized */}
              <div className="bg-white rounded-2xl p-5 lg:p-8 animate-fade-in shadow-sm border border-gray-100/50">
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
              </div>
            </div>

            {/* Right Column - Sidebar - Mobile Optimized */}
            <div className="space-y-6">
              {/* Saved Places */}
              <SavedPlaces
                userId={supabaseUser?.id || ""}
                onLocationSelect={(location) => {
                  setSelectedLocation(location);
                  setShowLocationPicker(false);
                }}
              />

              {/* AI Health Insights */}
              <LLMResponseCard
                response={llmResponse}
                isVisible={showLlmResponse}
              />

              {/* Personalized Health Tips */}
              <TipsCard tips={tips || []} className="mt-6" />
            </div>
          </div>
        </div>

        {/* Export/Share Button - Desktop Only */}
        {airQualityData && (
          <div className="hidden lg:block">
            <ExportShareButton
              airQualityData={{
                aqi: airQualityData.aqi,
                category: airQualityData.category,
                dominantPollutant: airQualityData.dominantPollutant,
                location: selectedLocation?.label || 'Unknown Location',
                timestamp: airQualityData.timestamp || new Date().toISOString()
              }}
            />
          </div>
        )}

        {/* Navigation */}
        <Navigation />
        
        {/* Floating Settings Button */}
        <FloatingSettingsButton />
      </div>
    </PageLayout>
  );
}
