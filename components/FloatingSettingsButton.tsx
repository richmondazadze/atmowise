"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { SettingsModal } from "./SettingsModal";

export function FloatingSettingsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Settings Button */}
      <div className="fixed bottom-28 right-6 z-50 lg:bottom-20 lg:right-6">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 rounded-full bg-[#6200D9] hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          aria-label="Settings"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
