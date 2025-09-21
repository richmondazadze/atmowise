'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export function SettingsToggle() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Settings Button */}
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="sm"
        className="h-9 px-3 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
