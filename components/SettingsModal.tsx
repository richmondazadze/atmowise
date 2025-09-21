'use client'

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Moon, Sun, Type, Palette, Bell, Shield, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [dataPrivacy, setDataPrivacy] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Settings
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize your AtmoWise experience
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </h3>
            
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                  <Label htmlFor="dark-mode" className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>

            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications" className="text-sm font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Get alerts about air quality changes
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Privacy Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy & Security
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="data-privacy" className="text-sm font-medium text-gray-900 dark:text-white">
                    Data Privacy
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Allow data collection for better insights
                  </p>
                </div>
                <Switch
                  id="data-privacy"
                  checked={dataPrivacy}
                  onCheckedChange={setDataPrivacy}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Sign Out */}
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
