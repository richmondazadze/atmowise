'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function SettingsToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Settings Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="h-9 px-3 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute -top-2 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[180px] z-50 transform -translate-y-full">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Theme Settings
            </h3>
            
            {/* Dark Mode Toggle */}
            <Button
              onClick={() => {
                toggleDarkMode();
                setIsOpen(false);
              }}
              variant="outline"
              className="w-full justify-start gap-3 h-10 text-sm"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
