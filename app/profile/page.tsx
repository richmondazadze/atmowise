"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";
import { Navigation } from "@/components/Navigation";
import { FloatingSettingsButton } from "@/components/FloatingSettingsButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Edit3, X, Save, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@shared/schema";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    sensitivity: {
      asthma: false,
      pregnant: false,
      ageGroup: "adult" as "child" | "adult" | "elderly",
      cardiopulmonary: false,
    },
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  // Fetch profile data
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        const response = await fetch(`/api/profile/${user.id}`);
        if (response.ok) {
          return response.json();
        }
        return null;
      } catch (error) {
        console.error("Profile fetch error:", error);
        return null;
      }
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          ...updatedProfile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      setHasChanges(false);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        sensitivity: {
          asthma: profile.sensitivity?.asthma || false,
          pregnant: profile.sensitivity?.pregnant || false,
          ageGroup: profile.sensitivity?.ageGroup || "adult",
          cardiopulmonary: profile.sensitivity?.cardiopulmonary || false,
        },
      });
    }
  }, [profile]);

  // Check for changes
  useEffect(() => {
    if (profile) {
      const hasFormChanges =
        formData.displayName !== (profile.displayName || "") ||
        formData.sensitivity.asthma !==
          (profile.sensitivity?.asthma || false) ||
        formData.sensitivity.pregnant !==
          (profile.sensitivity?.pregnant || false) ||
        formData.sensitivity.ageGroup !==
          (profile.sensitivity?.ageGroup || "adult") ||
        formData.sensitivity.cardiopulmonary !==
          (profile.sensitivity?.cardiopulmonary || false);

      setHasChanges(hasFormChanges);
    }
  }, [formData, profile]);

  const handleSave = () => {
    if (!profile) return;

    updateProfileMutation.mutate({
      displayName: formData.displayName,
      sensitivity: formData.sensitivity,
    });
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        sensitivity: {
          asthma: profile.sensitivity?.asthma || false,
          pregnant: profile.sensitivity?.pregnant || false,
          ageGroup: profile.sensitivity?.ageGroup || "adult",
          cardiopulmonary: profile.sensitivity?.cardiopulmonary || false,
        },
      });
    }
    setIsEditing(false);
    setHasChanges(false);
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
          className="lg:hidden sticky top-0 z-40 dark:bg-gray-900 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 py-4 mb-6"
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
                  <User className="h-5 w-5 text-white drop-shadow-sm" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-[#0A1C40] tracking-tight truncate">
                    Profile
                  </h1>
                  <p className="text-xs text-[#64748B] font-medium truncate">
                    Account & preferences
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <AnimatePresence>
                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200 text-xs px-2 py-1 rounded-full font-medium"
                      >
                        Unsaved
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-9 px-3 border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-medium touch-target transition-all duration-200 hover:scale-105"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
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
                <h1 className="heading-1 text-[#0A1C40]">Profile</h1>
                <p className="body-large text-[#64748B]">
                  Manage your account and health preferences
                </p>
              </motion.div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                <AnimatePresence>
                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                      >
                        Unsaved Changes
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 h-11 px-4 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
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
          className="px-4 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-8 dark:bg-gray-800"
        >
          <div className="max-w-4xl mx-auto">
            {profileLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="animate-pulse"
                  >
                    <div className="h-32 bg-gray-200 rounded-xl" />
                  </motion.div>
                ))}
              </div>
            ) : profileError ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to load profile
                </h3>
                <p className="text-gray-600 mb-4">
                  There was an error loading your profile data.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Basic Information */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-[#6200D9]" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={formData.displayName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                displayName: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            placeholder="Enter your display name"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Health Sensitivity */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-[#6200D9]" />
                        Health Sensitivity
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Help us provide personalized air quality recommendations
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="asthma">Asthma</Label>
                              <p className="text-sm text-gray-600">
                                I have asthma or breathing difficulties
                              </p>
                            </div>
                            <Switch
                              id="asthma"
                              checked={formData.sensitivity.asthma}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sensitivity: {
                                    ...prev.sensitivity,
                                    asthma: checked,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="pregnant">Pregnant</Label>
                              <p className="text-sm text-gray-600">
                                I am currently pregnant
                              </p>
                            </div>
                            <Switch
                              id="pregnant"
                              checked={formData.sensitivity.pregnant}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sensitivity: {
                                    ...prev.sensitivity,
                                    pregnant: checked,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="cardiopulmonary">
                                Cardiopulmonary Issues
                              </Label>
                              <p className="text-sm text-gray-600">
                                I have heart or lung conditions
                              </p>
                            </div>
                            <Switch
                              id="cardiopulmonary"
                              checked={formData.sensitivity.cardiopulmonary}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sensitivity: {
                                    ...prev.sensitivity,
                                    cardiopulmonary: checked,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ageGroup">Age Group</Label>
                            <select
                              id="ageGroup"
                              value={formData.sensitivity.ageGroup}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sensitivity: {
                                    ...prev.sensitivity,
                                    ageGroup: e.target.value as
                                      | "child"
                                      | "adult"
                                      | "elderly",
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6200D9] focus:border-transparent"
                            >
                              <option value="child">Child (0-12)</option>
                              <option value="adult">Adult (13-64)</option>
                              <option value="elderly">Elderly (65+)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Save Button */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex justify-end gap-3"
                    >
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateProfileMutation.isPending}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={
                          !hasChanges || updateProfileMutation.isPending
                        }
                        className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
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
