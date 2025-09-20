import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/useGeolocation";
import { RiskCard } from "@/components/RiskCard";
import { ProfileToggles } from "@/components/ProfileToggles";
import { SymptomForm } from "@/components/SymptomForm";
import { LLMResponseCard } from "@/components/LLMResponseCard";
import { CrisisModal } from "@/components/CrisisModal";
import { BottomNav } from "@/components/BottomNav";
import { MapPin, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile, User } from "@shared/schema";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [llmResponse, setLlmResponse] = useState<any>(null);
  const [showLlmResponse, setShowLlmResponse] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const { lat, lon, error: locationError, loading: locationLoading, refetch: refetchLocation } = useGeolocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize anonymous user
  useEffect(() => {
    const initUser = async () => {
      try {
        const response = await apiRequest("POST", "/api/user/anonymous");
        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to create user:", error);
        toast({
          title: "Setup Error",
          description: "Failed to initialize user session.",
          variant: "destructive",
        });
      }
    };

    initUser();
  }, [toast]);

  // Get user profile
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error("No user ID");
      
      const response = await fetch(`/api/profile/${currentUser.id}`);
      if (response.status === 404) {
        // Create default profile
        const createResponse = await apiRequest("POST", "/api/profile", {
          userId: currentUser.id,
          sensitivity: {},
        });
        return createResponse.json();
      }
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: Boolean(currentUser?.id),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!currentUser?.id) throw new Error("No user ID");
      
      const response = await apiRequest("PUT", `/api/profile/${currentUser.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", currentUser?.id] });
      toast({
        title: "Profile updated",
        description: "Your sensitivity settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to save profile changes.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (updates: Partial<Profile>) => {
    updateProfileMutation.mutate(updates);
  };

  const handleSymptomLogged = (response: any) => {
    setLlmResponse(response);
    setShowLlmResponse(true);
    
    // Check for emergency
    if (response.severity === "high") {
      setShowCrisisModal(true);
    }
  };

  const handleLocationRefresh = () => {
    refetchLocation();
    toast({
      title: "Refreshing location",
      description: "Getting your current location...",
    });
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">AtmoWise</h1>
          </div>
        </div>
      </header>

      {/* Location Bar */}
      <div className="px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary" />
            <span data-testid="text-location">
              {locationLoading
                ? "Getting location..."
                : locationError
                ? "Location unavailable"
                : lat && lon
                ? `${lat.toFixed(2)}, ${lon.toFixed(2)}`
                : "Location required"}
            </span>
          </div>
          <button
            onClick={handleLocationRefresh}
            className="text-primary hover:text-primary/80 transition-colors"
            data-testid="button-refresh-location"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 px-4 space-y-4">
        {/* Risk Card */}
        <div className="mt-4">
          <RiskCard
            lat={lat}
            lon={lon}
            profile={profile || null}
            onRefresh={handleLocationRefresh}
          />
        </div>

        {/* Profile Toggles */}
        <ProfileToggles
          profile={profile || null}
          onUpdate={handleProfileUpdate}
        />

        {/* Symptom Form */}
        {currentUser && (
          <SymptomForm
            userId={currentUser.id}
            profile={profile || null}
            airData={null} // Will be fetched internally
            onSymptomLogged={handleSymptomLogged}
          />
        )}

        {/* AI Response */}
        <LLMResponseCard
          response={llmResponse}
          isVisible={showLlmResponse}
          onEmergency={() => setShowCrisisModal(true)}
        />
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCrisis={() => setShowCrisisModal(true)} />

      {/* Crisis Modal */}
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />
    </div>
  );
}
