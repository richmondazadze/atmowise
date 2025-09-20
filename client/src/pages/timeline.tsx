import { useState, useEffect } from "react";
import { TimelineChart } from "@/components/TimelineChart";
import { BottomNav } from "@/components/BottomNav";
import { CrisisModal } from "@/components/CrisisModal";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin } from "lucide-react";
import type { User } from "@shared/schema";

export default function Timeline() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const { lat, lon, error: locationError, loading: locationLoading } = useGeolocation();

  // Get user from localStorage or create anonymous
  useEffect(() => {
    const getUserData = async () => {
      try {
        // For simplicity, create a new anonymous user
        // In a real app, you'd persist this in localStorage
        const response = await fetch("/api/user/anonymous", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to get user:", error);
      }
    };

    getUserData();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Timeline</h1>
          </div>
        </div>
      </header>

      {/* Location Bar */}
      <div className="px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
      </div>

      {/* Main Content */}
      <main className="pb-20 px-4 space-y-4">
        <div className="mt-4">
          {currentUser && lat && lon ? (
            <TimelineChart
              userId={currentUser.id}
              lat={lat}
              lon={lon}
            />
          ) : (
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border text-center">
              <p className="text-muted-foreground">
                {!currentUser ? "Loading user data..." : "Location required for timeline"}
              </p>
            </div>
          )}
        </div>
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
