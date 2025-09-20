'use client'

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Heart, Lungs, Baby, User, Shield, Zap, CheckCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentProfile?: any;
}

export function ProfileSetupModal({ isOpen, onClose, userId, currentProfile }: ProfileSetupModalProps) {
  const [profileData, setProfileData] = useState({
    displayName: currentProfile?.displayName || '',
    ageGroup: currentProfile?.sensitivity?.ageGroup || 'adult' as 'child' | 'adult' | 'elderly',
    sensitivity: {
      asthma: currentProfile?.sensitivity?.asthma || false,
      copd: currentProfile?.sensitivity?.copd || false,
      smoker: currentProfile?.sensitivity?.smoker || false,
      pregnant: currentProfile?.sensitivity?.pregnant || false,
      cardiopulmonary: currentProfile?.sensitivity?.cardiopulmonary || false,
      heartDisease: currentProfile?.sensitivity?.heartDisease || false,
      diabetes: currentProfile?.sensitivity?.diabetes || false,
    },
    notifications: {
      airQualityAlerts: currentProfile?.notifications?.airQualityAlerts ?? true,
      healthTips: currentProfile?.notifications?.healthTips ?? true,
      weeklyReports: currentProfile?.notifications?.weeklyReports ?? false,
    }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      toast({
        title: "Profile updated",
        description: "Your health profile has been saved successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const updateSensitivity = (key: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      sensitivity: {
        ...prev.sensitivity,
        [key]: value
      }
    }));
  };

  const updateNotifications = (key: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const getRiskLevel = () => {
    const conditions = Object.values(profileData.sensitivity).filter(Boolean).length;
    if (conditions >= 3) return { level: 'High', color: 'bg-red-100 text-red-800', icon: Shield };
    if (conditions >= 1) return { level: 'Moderate', color: 'bg-yellow-100 text-yellow-800', icon: Heart };
    return { level: 'Low', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const riskInfo = getRiskLevel();
  const RiskIcon = riskInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl mx-4" style={{ zIndex: 9999 }}>
        <DialogHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6200D9] to-[#4C00A8] rounded-xl flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-lg lg:text-xl font-bold text-[#0A1C40]">
            Complete Your Health Profile
          </DialogTitle>
          <DialogDescription className="text-sm lg:text-base text-[#64748B] leading-relaxed">
            Help us provide better air quality recommendations for your health
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-80 overflow-y-auto">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-semibold text-[#0A1C40] mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6200D9] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0A1C40] mb-2">
              Age Group
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'child', label: 'Child', icon: Baby },
                { value: 'adult', label: 'Adult', icon: User },
                { value: 'elderly', label: 'Elderly', icon: Heart }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setProfileData(prev => ({ ...prev, ageGroup: value as any }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 touch-target ${
                    profileData.ageGroup === value
                      ? 'border-[#6200D9] bg-[#6200D9]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mx-auto mb-2 text-[#6200D9]" />
                  <div className="text-sm font-semibold text-[#0A1C40]">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Health Conditions */}
          <div>
            <label className="block text-sm font-semibold text-[#0A1C40] mb-3">
              Health Conditions
            </label>
            <div className="space-y-3">
              {[
                { key: 'asthma', label: 'Asthma', icon: Lungs },
                { key: 'copd', label: 'COPD', icon: Lungs },
                { key: 'smoker', label: 'Smoker', icon: Zap },
                { key: 'pregnant', label: 'Pregnant', icon: Baby },
                { key: 'heartDisease', label: 'Heart Disease', icon: Heart },
                { key: 'diabetes', label: 'Diabetes', icon: Shield },
                { key: 'cardiopulmonary', label: 'Other Cardiopulmonary', icon: Heart }
              ].map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg touch-target"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-[#6200D9] flex-shrink-0" />
                    <span className="text-sm font-medium text-[#0A1C40]">{label}</span>
                  </div>
                  <Switch
                    checked={profileData.sensitivity[key as keyof typeof profileData.sensitivity]}
                    onCheckedChange={(checked) => updateSensitivity(key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Risk Level Indicator */}
          <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RiskIcon className="h-4 w-4 text-[#6200D9]" />
                <span className="text-sm font-semibold text-[#0A1C40]">Risk Level</span>
              </div>
              <Badge className={`px-2 py-1 text-xs ${riskInfo.color}`}>
                {riskInfo.level}
              </Badge>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="block text-sm font-semibold text-[#0A1C40] mb-3">
              Notifications
            </label>
            <div className="space-y-3">
              {[
                { key: 'airQualityAlerts', label: 'Air Quality Alerts' },
                { key: 'healthTips', label: 'Health Tips' },
                { key: 'weeklyReports', label: 'Weekly Reports' }
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg touch-target"
                >
                  <span className="text-sm font-medium text-[#0A1C40]">{label}</span>
                  <Switch
                    checked={profileData.notifications[key as keyof typeof profileData.notifications]}
                    onCheckedChange={(checked) => updateNotifications(key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-3 touch-target order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || !profileData.displayName.trim()}
            className="px-6 py-3 bg-gradient-to-r from-[#6200D9] to-[#4C00A8] text-white font-semibold touch-target order-1 sm:order-2"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
