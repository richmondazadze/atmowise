import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ProfileToggles } from "@/components/ProfileToggles";
import { BottomNav } from "@/components/BottomNav";
import { CrisisModal } from "@/components/CrisisModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Trash2 } from "lucide-react";
import type { Profile, User as UserType } from "@shared/schema";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user
  useEffect(() => {
    const getUserData = async () => {
      try {
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
        description: "Your profile has been saved successfully.",
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

  const handleSaveDisplayName = () => {
    if (displayName.trim()) {
      handleProfileUpdate({ displayName: displayName.trim() });
    }
  };

  const handleClearData = () => {
    // In a real app, this would delete user data
    toast({
      title: "Data cleared",
      description: "Your symptom data has been cleared.",
    });
  };

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Profile</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4 space-y-4">
        {/* Display Name */}
        <div className="mt-4">
          <Card className="bg-card rounded-2xl shadow-sm border border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName" className="text-sm font-medium text-card-foreground">
                    Display Name (Optional)
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                      data-testid="input-display-name"
                    />
                    <Button
                      onClick={handleSaveDisplayName}
                      disabled={!displayName.trim() || updateProfileMutation.isPending}
                      data-testid="button-save-name"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sensitivity Settings */}
        {profile && (
          <ProfileToggles
            profile={profile}
            onUpdate={handleProfileUpdate}
          />
        )}

        {/* Data Management */}
        <Card className="bg-card rounded-2xl shadow-sm border border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Data Management</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-card-foreground mb-2">
                  Your data includes symptom logs and sensitivity settings.
                </p>
                <p className="text-xs text-muted-foreground">
                  We don't store personal identifying information unless you provide it.
                </p>
              </div>
              
              <Button
                variant="destructive"
                onClick={handleClearData}
                className="w-full"
                data-testid="button-clear-data"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear My Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="bg-card rounded-2xl shadow-sm border border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">About AtmoWise</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Version 1.0.0</p>
              <p>Air quality data provided by OpenWeather and OpenAQ</p>
              <p>AI analysis powered by OpenAI</p>
              <p className="text-xs pt-2">
                For educational and demonstration purposes. 
                Always consult healthcare professionals for medical advice.
              </p>
            </div>
          </CardContent>
        </Card>
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
