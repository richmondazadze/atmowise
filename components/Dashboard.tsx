"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { EnhancedRiskCard } from "@/components/EnhancedRiskCard";
import { SavedPlaces } from "@/components/SavedPlaces";
import { SymptomForm } from "@/components/SymptomForm";
import { LLMResponseCard } from "@/components/LLMResponseCard";
import { TipsCard } from "@/components/TipsCard";
import { Navigation } from "@/components/Navigation";
import { PageLayout } from "@/components/PageLayout";
import { LocationPickerModal } from "@/components/LocationPickerModal";
import { AIQAExplainer } from "@/components/AIQAExplainer";
import { RunCoach } from "@/components/RunCoach";
import { ExportShareButton } from "@/components/ExportShareButton";
import { FloatingSettingsButton } from "@/components/FloatingSettingsButton";
import {
  MapPin,
  RefreshCw,
  LogOut,
  User,
  Wind,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { Profile } from "@shared/schema";

export default function Dashboard() {
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
    queryKey: ["air-quality", airQualityLat, airQualityLon, supabaseUser?.id],
    queryFn: async () => {
      if (!supabaseUser?.id) {
        // Return demo data if no user
        return {
          lat: airQualityLat,
          lon: airQualityLon,
          source: "demo",
          timestamp: new Date(),
          pm25: 25,
          pm10: 45,
          o3: 60,
          no2: 30,
          aqi: 75,
          category: "Moderate",
          dominantPollutant: "PM2.5",
          rawPayload: { demo: true },
          demo: true,
        };
      }

      try {
        // Validate coordinates before making API calls
        if (isNaN(airQualityLat) || isNaN(airQualityLon)) {
          console.warn("Invalid coordinates, using fallback data");
          return {
            lat: fallbackLat,
            lon: fallbackLon,
            source: "demo",
            timestamp: new Date(),
            pm25: 25,
            pm10: 45,
            o3: 60,
            no2: 30,
            aqi: 75,
            category: "Moderate",
            dominantPollutant: "PM2.5",
            rawPayload: { demo: true },
            demo: true,
          };
        }

        const url = `/api/air?lat=${airQualityLat}&lon=${airQualityLon}&address=${encodeURIComponent(
          selectedLocation?.label || currentLocationLabel
        )}&userId=${supabaseUser.id}`;
        const response = await fetch(url);
        if (!response.ok) {
          console.error(
            "Air quality API error:",
            response.status,
            response.statusText
          );
          throw new Error(
            `Failed to fetch air quality: ${response.statusText}`
          );
        }
        return response.json();
      } catch (error) {
        console.error("Air quality fetch error:", error);
        // Return demo data on error
        return {
          lat: airQualityLat || fallbackLat,
          lon: airQualityLon || fallbackLon,
          source: "demo",
          timestamp: new Date(),
          pm25: 25,
          pm10: 45,
          o3: 60,
          no2: 30,
          aqi: 75,
          category: "Moderate",
          dominantPollutant: "PM2.5",
          rawPayload: {
            demo: true,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          demo: true,
          error: true,
        };
      }
    },
    enabled: true, // Always enabled, will use fallback coordinates
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });

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

  // Auto-show profile setup for new users (disabled for now)
  // useEffect(() => {
  //   if (profile && needsProfileSetup && !showProfileSetup) {
  //     setShowProfileSetup(true);
  //   }
  // }, [profile, needsProfileSetup, showProfileSetup]);

  // Symptoms data for counting
  const { data: symptoms = [], isLoading: symptomsLoading } = useQuery({
    queryKey: ["symptoms", supabaseUser?.id],
    queryFn: async () => {
      try {
        if (!supabaseUser?.id) {
          console.log("No user ID available for symptoms query");
          return [];
        }

        console.log("Fetching symptoms for user:", supabaseUser.id);
        const response = await fetch(
          `/api/symptoms?userId=${supabaseUser.id}&limit=100`
        );
        if (!response.ok) {
          console.error(
            "Failed to fetch symptoms:",
            response.status,
            response.statusText
          );
          return [];
        }
        const data = await response.json();
        console.log("Symptoms fetched:", data.length);
        return data;
      } catch (error) {
        console.error("Symptoms fetch error:", error);
        return [];
      }
    },
    enabled: !!supabaseUser?.id,
  });

  // Tips data
  const { data: tips, isLoading: tipsLoading } = useQuery({
    queryKey: ["tips", supabaseUser?.id],
    queryFn: async () => {
      try {
        if (!supabaseUser?.id) {
          console.log("No user ID available for tips query");
          return [];
        }

        console.log("Fetching tips for user:", supabaseUser.id);
        const response = await fetch(
          `/api/tips?userId=${supabaseUser.id}&limit=10`
        );
        if (!response.ok) {
          console.error(
            "Failed to fetch tips:",
            response.status,
            response.statusText
          );
          return [];
        }
        const data = await response.json();
        console.log("Tips fetched:", data.length);
        return data;
      } catch (error) {
        console.error("Tips fetch error:", error);
        return [];
      }
    },
    enabled: !!supabaseUser?.id,
  });

  // Saved places data
  const { data: savedPlaces = [], isLoading: savedPlacesLoading } = useQuery({
    queryKey: ["saved-places", supabaseUser?.id],
    queryFn: async () => {
      try {
        if (!supabaseUser?.id) {
          console.log("No user ID available for saved places query");
          return [];
        }

        console.log("Fetching saved places for user:", supabaseUser.id);
        const response = await fetch(
          `/api/saved-places?userId=${supabaseUser.id}`
        );
        if (!response.ok) {
          console.error(
            "Failed to fetch saved places:",
            response.status,
            response.statusText
          );
          return [];
        }
        const data = await response.json();
        console.log("Saved places fetched:", data.length);
        return data;
      } catch (error) {
        console.error("Saved places fetch error:", error);
        return [];
      }
    },
    enabled: !!supabaseUser?.id,
  });

  // LLM response
  const [llmResponse, setLlmResponse] = useState<{
    summary: string;
    action: string;
    severity: "low" | "moderate" | "high";
    explainers?: string;
    emergency?: boolean;
    tips?: any[];
  } | null>(null);
  const [showLlmResponse, setShowLlmResponse] = useState(false);


  // Handle location selection
  const handleLocationSelect = (location: {
    lat: number;
    lon: number;
    label: string;
  }) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
    // The query will automatically refetch with new coordinates due to queryKey change
  };

  // Handle tip interactions (helpful/not helpful)
  const handleTipInteraction = async (
    tipId: string,
    type: "helpful" | "not_helpful"
  ) => {
    try {
      await fetch("/api/user-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: supabaseUser?.id,
          type: type === "helpful" ? "tip_helpful" : "tip_not_helpful",
          targetId: tipId,
        }),
      });

      // Show feedback
      toast({
        title: "Thank you for your feedback!",
        description: `Your response has been recorded.`,
      });
    } catch (error) {
      console.error("Failed to record tip interaction:", error);
    }
  };

  // Handle location refresh
  const handleLocationRefresh = () => {
    refetchLocation();
    refetchAirQuality();
  };

  // Get AQI info
  const getAQIInfo = (aqi: number | null) => {
    if (!aqi)
      return {
        label: "Unknown",
        color: "bg-gray-500",
        textColor: "text-gray-500",
      };

    if (aqi <= 50)
      return {
        label: "Good",
        color: "bg-green-500",
        textColor: "text-green-600",
      };
    if (aqi <= 100)
      return {
        label: "Moderate",
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
      };
    if (aqi <= 150)
      return {
        label: "Unhealthy for Sensitive Groups",
        color: "bg-orange-500",
        textColor: "text-orange-600",
      };
    if (aqi <= 200)
      return {
        label: "Unhealthy",
        color: "bg-red-500",
        textColor: "text-red-600",
      };
    if (aqi <= 300)
      return {
        label: "Very Unhealthy",
        color: "bg-purple-500",
        textColor: "text-purple-600",
      };
    return {
      label: "Hazardous",
      color: "bg-red-800",
      textColor: "text-red-800",
    };
  };

  if (!supabaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6200D9] mx-auto mb-4"></div>
          <p className="text-gray-600">Please sign in to view your dashboard</p>
        </div>
      </div>
    );
  }

  const aqiInfo = getAQIInfo(airQualityData?.aqi);

  return (
    <PageLayout>
      {/* Mobile Header - Premium Design */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-11 h-11 bg-gradient-to-br from-[#6200D9] via-[#7C3AED] to-[#4C00A8] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-white/20">
                <Wind className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-[#0A1C40] truncate tracking-tight">
                  AtmoWise
                </h1>
                <p className="text-xs text-[#64748B] truncate font-medium">
                  Air Quality Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="flex items-center gap-2 text-xs px-3 py-2.5 h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 touch-target rounded-xl font-medium"
              >
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline truncate max-w-24 font-medium">
                  {selectedLocation
                    ? selectedLocation.label.split(",")[0]
                    : "Location"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLocationRefresh}
                disabled={locationLoading || airQualityLoading}
                className="p-2.5 h-11 w-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 touch-target rounded-xl"
              >
                <RefreshCw
                  className={`h-4 w-4 transition-transform duration-500 ${
                    locationLoading || airQualityLoading
                      ? "animate-spin"
                      : "hover:rotate-180"
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="p-2.5 h-11 w-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 touch-target rounded-xl"
              >
                <LogOut className="h-4 w-4" />
              </Button>
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
              <p className="body-large text-[#64748B]">
                Monitor air quality and your health insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="flex items-center gap-2 border-[#E2E8F0] hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4" />
                {selectedLocation ? selectedLocation.label : "Select Location"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Location Status */}
      <div className="lg:hidden bg-[#F8FAFC] dark:bg-gray-900 border-b border-[#E2E8F0] dark:border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-[#6200D9] dark:text-purple-400 flex-shrink-0" />
          <span className="text-[#64748B] dark:text-gray-300 truncate flex-1 min-w-0">
                  {locationLoading && !selectedLocation
                    ? "Getting location..."
                    : locationError && !selectedLocation
                    ? "Location unavailable"
                    : currentLocationLabel}
                </span>
                {selectedLocation && (
            <span className="text-xs bg-[#6200D9] dark:bg-purple-600 text-white px-2 py-1 rounded-full font-medium flex-shrink-0">
                    Selected
                  </span>
                )}
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="px-4 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-8">
            {/* Welcome Section - Premium Mobile Design */}
            <div className="bg-white rounded-2xl lg:rounded-2xl p-5 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100/50">
              <div className="flex items-center space-x-4 mb-4 lg:mb-6">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#6200D9] via-[#7C3AED] to-[#4C00A8] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-white/20">
                  <Wind className="h-6 w-6 lg:h-7 lg:w-7 text-white drop-shadow-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl lg:text-2xl font-bold text-[#0A1C40] mb-1 tracking-tight">
                    Welcome back!
                  </h2>
                  <p className="text-sm lg:text-base text-[#64748B] leading-relaxed font-medium">
                    Track your air quality exposure and get personalized
                    insights
                  </p>
                </div>
              </div>
            </div>

            {/* Location Picker Modal */}
            <LocationPickerModal
              isOpen={showLocationPicker}
              onClose={() => setShowLocationPicker(false)}
                onLocationSelect={handleLocationSelect}
                currentLocation={selectedLocation || undefined}
              onUseCurrentLocation={async () => {
                if (currentLat && currentLon) {
                  // Get a readable address for the current location
                  try {
                    const response = await fetch(
                      `/api/location/reverse?lat=${currentLat}&lon=${currentLon}`
                    );
                    if (response.ok) {
                      const data = await response.json();
                      if (data.length > 0) {
                        const location = data[0];
                        const label = `${location.name}, ${
                          location.state || location.country
                        }`;
                        const currentLocationData = {
                          lat: currentLat,
                          lon: currentLon,
                          label: label,
                        };
                        setSelectedLocation(currentLocationData);
                        setShowLocationPicker(false);
                        return;
                      }
                    }
                  } catch (error) {
                    console.warn(
                      "Failed to get address for current location:",
                      error
                    );
                  }

                  // Fallback to coordinates if geocoding fails
                  const currentLocationData = {
                    lat: currentLat,
                    lon: currentLon,
                    label: `Current Location (${currentLat.toFixed(
                      4
                    )}, ${currentLon.toFixed(4)})`,
                  };
                  setSelectedLocation(currentLocationData);
                  setShowLocationPicker(false);
                } else {
                  // Request location permission if not available
                  await requestLocationPermission();
                  setShowLocationPicker(false);
                }
              }}
              isCurrentLocationLoading={locationLoading}
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
          <div className="space-y-4 lg:space-y-6">
            {/* Quick Stats - Premium Mobile Design */}
            <div className="bg-white rounded-2xl p-5 lg:p-6 hover:shadow-lg transition-all duration-300 shadow-sm border border-gray-100/50">
              <h3 className="text-lg lg:text-xl font-bold text-[#0A1C40] mb-5 lg:mb-6 tracking-tight">
                Quick Stats
              </h3>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
                  <span className="text-sm lg:text-base text-[#64748B] font-semibold">
                    Air Quality
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-bold ${aqiInfo.color} text-white shadow-sm`}
                  >
                    {aqiInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
                  <span className="text-sm lg:text-base text-[#64748B] font-semibold">
                    Symptoms Logged
                  </span>
                  <span className="text-sm lg:text-base text-[#0A1C40] font-bold">
                    {symptomsLoading ? "..." : symptoms.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
                  <span className="text-sm lg:text-base text-[#64748B] font-semibold">
                    AI Insights
                  </span>
                  <span className="text-sm lg:text-base text-[#0A1C40] font-bold">
                    0
                  </span>
                </div>
              </div>
            </div>

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


      {/* Profile Setup Modal - Disabled for now */}
      {/* <ProfileSetupModal
        isOpen={showProfileSetup}
        onClose={() => {
          setShowProfileSetup(false);
          // Reset the flag when modal is closed
          setProfileSetupShown(false);
        }}
        onProfileCompleted={() => {
          // Profile is completed, reset the flag so it won't show again
          setProfileSetupShown(true);
        }}
        userId={supabaseUser?.id || ''}
        currentProfile={profile}
      /> */}

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
    </PageLayout>
  );
}
