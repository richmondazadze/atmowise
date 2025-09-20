'use client'

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Bell, Shield, MapPin, Save, Edit3, X, Check, Wind } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { PageLayout } from '@/components/PageLayout';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    sensitivity: {
      asthma: false,
      pregnant: false,
      ageGroup: 'adult',
      cardiopulmonary: false
    },
    notifications: {
      airQualityAlerts: true,
      healthTips: true,
      weeklyReports: false
    }
  });

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const response = await fetch(`/api/profile/${user.id}`);
        if (response.ok) {
          return response.json();
        }
        return null;
      } catch (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Sync profile data when profile changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        displayName: profile.displayName || user?.email?.split('@')[0] || 'User',
        sensitivity: {
          asthma: profile.sensitivity?.asthma || false,
          pregnant: profile.sensitivity?.pregnant || false,
          ageGroup: profile.sensitivity?.ageGroup || 'adult',
          cardiopulmonary: profile.sensitivity?.cardiopulmonary || false
        },
        notifications: {
          airQualityAlerts: profile.notifications?.airQualityAlerts ?? true,
          healthTips: profile.notifications?.healthTips ?? true,
          weeklyReports: profile.notifications?.weeklyReports ?? false
        }
      });
    }
  }, [profile, user?.email]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error('User ID required');
      
      const response = await fetch(`/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      setHasChanges(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const hasFormChanges = JSON.stringify(profileData) !== JSON.stringify(profile);
      setHasChanges(hasFormChanges);
    }
  }, [profileData, profile]);

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancel = () => {
    if (profile) {
      setProfileData(profile);
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setProfileData(prev => {
      const currentParent = prev[parent as keyof typeof prev];
      return {
        ...prev,
        [parent]: {
          ...(currentParent && typeof currentParent === 'object' ? currentParent : {}),
          [field]: value
        }
      };
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6200D9] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading || !profileData) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6200D9] mx-auto mb-4"></div>
            <p className="text-[#64748B]">Loading profile...</p>
          </div>
        </div>
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
                <User className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0A1C40] tracking-tight">Profile</h1>
                <p className="text-xs text-[#64748B] font-medium">Account & preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs px-2 py-1 rounded-full font-medium">
                  Unsaved
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-9 px-3 border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-medium touch-target"
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
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-30 header-premium">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 text-[#0A1C40]">Profile</h1>
              <p className="body-large text-[#64748B]">Manage your account and health preferences</p>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Unsaved changes
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="border-[#E2E8F0] hover:bg-gray-50"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content - Mobile Optimized */}
      <div className="px-4 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-8">
        <div className="max-w-4xl mx-auto space-y-4 lg:space-y-8">
          {/* Basic Information - Mobile Optimized */}
          <div className="bg-white rounded-2xl p-5 lg:p-8 shadow-sm border border-gray-100/50">
            <div className="pb-4 lg:pb-6">
              <h2 className="text-lg lg:text-xl font-bold text-[#0A1C40] flex items-center gap-3 tracking-tight">
                <User className="h-5 w-5 lg:h-6 lg:w-6" />
                Basic Information
              </h2>
            </div>
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm lg:text-base text-[#0A1C40] font-semibold">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    disabled={!isEditing}
                    className="h-11 border-gray-200 focus:border-[#6200D9] focus:ring-[#6200D9] rounded-xl text-base touch-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm lg:text-base text-[#0A1C40] font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="h-11 bg-gray-50 border-gray-200 text-[#64748B] rounded-xl text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Health Sensitivity - Mobile Optimized */}
          <div className="bg-white rounded-2xl p-5 lg:p-8 shadow-sm border border-gray-100/50">
            <div className="pb-4 lg:pb-6">
              <h2 className="text-lg lg:text-xl font-bold text-[#0A1C40] flex items-center gap-3 tracking-tight">
                <Shield className="h-5 w-5 lg:h-6 lg:w-6" />
                Health Sensitivity
              </h2>
              <p className="text-sm lg:text-base text-[#64748B] font-medium mt-2">
                Help us provide personalized air quality recommendations
              </p>
            </div>
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100 touch-target">
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm lg:text-base text-[#0A1C40] font-semibold">Asthma</Label>
                      <p className="text-xs lg:text-sm text-[#64748B] font-medium">I have asthma or breathing conditions</p>
                    </div>
                    <Switch
                      checked={profileData.sensitivity.asthma}
                      onCheckedChange={(checked) => handleNestedChange('sensitivity', 'asthma', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100 touch-target">
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm lg:text-base text-[#0A1C40] font-semibold">Pregnant</Label>
                      <p className="text-xs lg:text-sm text-[#64748B] font-medium">I am currently pregnant</p>
                    </div>
                    <Switch
                      checked={profileData.sensitivity.pregnant}
                      onCheckedChange={(checked) => handleNestedChange('sensitivity', 'pregnant', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100 touch-target">
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm lg:text-base text-[#0A1C40] font-semibold">Cardiopulmonary</Label>
                      <p className="text-xs lg:text-sm text-[#64748B] font-medium">I have heart or lung conditions</p>
                    </div>
                    <Switch
                      checked={profileData.sensitivity.cardiopulmonary}
                      onCheckedChange={(checked) => handleNestedChange('sensitivity', 'cardiopulmonary', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm lg:text-base text-[#0A1C40] font-semibold">Age Group</Label>
                  <Select
                    value={profileData.sensitivity.ageGroup}
                    onValueChange={(value) => handleNestedChange('sensitivity', 'ageGroup', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:border-[#6200D9] focus:ring-[#6200D9] rounded-xl text-base touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child (0-12)</SelectItem>
                      <SelectItem value="teen">Teen (13-17)</SelectItem>
                      <SelectItem value="adult">Adult (18-64)</SelectItem>
                      <SelectItem value="senior">Senior (65+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications - Mobile Optimized */}
          <div className="bg-white rounded-2xl p-5 lg:p-8 shadow-sm border border-gray-100/50">
            <div className="pb-4 lg:pb-6">
              <h2 className="text-lg lg:text-xl font-bold text-[#0A1C40] flex items-center gap-3 tracking-tight">
                <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
                Notifications
              </h2>
              <p className="text-sm lg:text-base text-[#64748B] font-medium mt-2">
                Choose how you want to be notified about air quality
              </p>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100 touch-target">
                <div className="min-w-0 flex-1">
                  <Label className="text-sm lg:text-base text-[#0A1C40] font-semibold">Air Quality Alerts</Label>
                  <p className="text-xs lg:text-sm text-[#64748B] font-medium">Get notified when air quality is poor</p>
                </div>
                <Switch
                  checked={profileData?.notifications?.airQualityAlerts ?? true}
                  onCheckedChange={(checked) => handleNestedChange('notifications', 'airQualityAlerts', checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100 touch-target">
                <div className="min-w-0 flex-1">
                  <Label className="text-sm lg:text-base text-[#0A1C40] font-semibold">Health Tips</Label>
                  <p className="text-xs lg:text-sm text-[#64748B] font-medium">Receive personalized health recommendations</p>
                </div>
                <Switch
                  checked={profileData?.notifications?.healthTips ?? true}
                  onCheckedChange={(checked) => handleNestedChange('notifications', 'healthTips', checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100 touch-target">
                <div className="min-w-0 flex-1">
                  <Label className="text-sm lg:text-base text-[#0A1C40] font-semibold">Weekly Reports</Label>
                  <p className="text-xs lg:text-sm text-[#64748B] font-medium">Get weekly air quality summaries</p>
                </div>
                <Switch
                  checked={profileData?.notifications?.weeklyReports ?? false}
                  onCheckedChange={(checked) => handleNestedChange('notifications', 'weeklyReports', checked)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Mobile Save Button */}
          {isEditing && (
            <div className="lg:hidden fixed bottom-20 left-4 right-4 z-50">
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="w-full h-12 bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white font-bold rounded-2xl shadow-lg touch-target"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </PageLayout>
  );
}