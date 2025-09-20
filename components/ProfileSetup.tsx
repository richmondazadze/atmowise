'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Heart, Lungs, Baby, User, Shield, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileSetupProps {
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function ProfileSetup({ userId, onComplete, onSkip }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    displayName: '',
    ageGroup: 'adult' as 'child' | 'adult' | 'elderly',
    sensitivity: {
      asthma: false,
      copd: false,
      smoker: false,
      pregnant: false,
      cardiopulmonary: false,
      heartDisease: false,
      diabetes: false,
    },
    notifications: {
      airQualityAlerts: true,
      healthTips: true,
      weeklyReports: false,
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
      onComplete();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateProfileMutation.mutate(profileData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="card-solid rounded-2xl shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6200D9] to-[#4C00A8] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0A1C40]">
              {step === 1 && 'Welcome to AtmoWise!'}
              {step === 2 && 'Health Profile Setup'}
              {step === 3 && 'Notification Preferences'}
            </CardTitle>
            <p className="text-[#64748B] mt-2">
              {step === 1 && 'Let\'s personalize your air quality experience'}
              {step === 2 && 'Help us provide better health recommendations'}
              {step === 3 && 'Choose how you want to stay informed'}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step >= stepNum
                      ? 'bg-[#6200D9] text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNum}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-[#0A1C40] mb-3">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6200D9] focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1C40] mb-3">
                    Age Group
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'child', label: 'Child', icon: Baby, desc: 'Under 18' },
                      { value: 'adult', label: 'Adult', icon: User, desc: '18-64 years' },
                      { value: 'elderly', label: 'Elderly', icon: Heart, desc: '65+ years' }
                    ].map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        onClick={() => setProfileData(prev => ({ ...prev, ageGroup: value as any }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          profileData.ageGroup === value
                            ? 'border-[#6200D9] bg-[#6200D9]/5 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-2 text-[#6200D9]" />
                        <div className="text-sm font-semibold text-[#0A1C40]">{label}</div>
                        <div className="text-xs text-[#64748B]">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Health Conditions */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Lungs className="h-12 w-12 text-[#6200D9] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[#0A1C40] mb-2">Health Conditions</h3>
                  <p className="text-sm text-[#64748B]">Select any conditions that apply to you</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'asthma', label: 'Asthma', icon: Lungs, desc: 'Respiratory condition' },
                    { key: 'copd', label: 'COPD', icon: Lungs, desc: 'Chronic obstructive pulmonary disease' },
                    { key: 'smoker', label: 'Smoker', icon: Zap, desc: 'Current or former smoker' },
                    { key: 'pregnant', label: 'Pregnant', icon: Baby, desc: 'Currently pregnant' },
                    { key: 'heartDisease', label: 'Heart Disease', icon: Heart, desc: 'Cardiovascular condition' },
                    { key: 'diabetes', label: 'Diabetes', icon: Shield, desc: 'Type 1 or Type 2 diabetes' },
                    { key: 'cardiopulmonary', label: 'Other Cardiopulmonary', icon: Heart, desc: 'Other heart/lung conditions' }
                  ].map(({ key, label, icon: Icon, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-[#6200D9]" />
                        <div>
                          <div className="font-semibold text-[#0A1C40]">{label}</div>
                          <div className="text-sm text-[#64748B]">{desc}</div>
                        </div>
                      </div>
                      <Switch
                        checked={profileData.sensitivity[key as keyof typeof profileData.sensitivity]}
                        onCheckedChange={(checked) => updateSensitivity(key, checked)}
                      />
                    </div>
                  ))}
                </div>

                {/* Risk Level Indicator */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RiskIcon className="h-5 w-5 text-[#6200D9]" />
                      <div>
                        <div className="font-semibold text-[#0A1C40]">Risk Level</div>
                        <div className="text-sm text-[#64748B]">Based on your health conditions</div>
                      </div>
                    </div>
                    <Badge className={`px-3 py-1 ${riskInfo.color}`}>
                      {riskInfo.level}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Notifications */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Zap className="h-12 w-12 text-[#6200D9] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[#0A1C40] mb-2">Notification Preferences</h3>
                  <p className="text-sm text-[#64748B]">Choose how you want to be notified</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'airQualityAlerts', label: 'Air Quality Alerts', desc: 'Get notified when air quality is poor' },
                    { key: 'healthTips', label: 'Health Tips', desc: 'Receive personalized health recommendations' },
                    { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Get weekly air quality summaries' }
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-[#0A1C40]">{label}</div>
                        <div className="text-sm text-[#64748B]">{desc}</div>
                      </div>
                      <Switch
                        checked={profileData.notifications[key as keyof typeof profileData.notifications]}
                        onCheckedChange={(checked) => updateNotifications(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={step === 1 ? onSkip : handleBack}
                className="px-6 py-2"
              >
                {step === 1 ? 'Skip Setup' : 'Back'}
              </Button>
              <Button
                onClick={handleNext}
                disabled={step === 1 && !profileData.displayName.trim()}
                className="px-6 py-2 bg-gradient-to-r from-[#6200D9] to-[#4C00A8] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {step === 3 ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
