'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Home, Briefcase, Dumbbell, GraduationCap, Save, X } from 'lucide-react';

interface SaveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number; lon: number; label: string };
  userId: string;
}

const PLACE_TYPES = [
  { key: 'home', label: 'Home', icon: Home, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'work', label: 'Work', icon: Briefcase, color: 'bg-green-100 text-green-800 border-green-200' },
  { key: 'gym', label: 'Gym', icon: Dumbbell, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { key: 'school', label: 'School', icon: GraduationCap, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { key: 'custom', label: 'Other', icon: MapPin, color: 'bg-gray-100 text-gray-800 border-gray-200' }
];

export function SaveLocationModal({ isOpen, onClose, location, userId }: SaveLocationModalProps) {
  const [placeName, setPlaceName] = useState('');
  const [selectedType, setSelectedType] = useState<'home' | 'work' | 'gym' | 'school' | 'custom'>('custom');
  const [customName, setCustomName] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create saved place mutation
  const createPlaceMutation = useMutation({
    mutationFn: async (placeData: {
      name: string;
      type: string;
      lat: number;
      lon: number;
      address: string;
    }) => {
      const response = await fetch('/api/saved-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...placeData
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save location');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-places', userId] });
      toast({
        title: "Location Saved!",
        description: `${placeName || PLACE_TYPES.find(t => t.key === selectedType)?.label} has been added to your saved places.`,
      });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save Location",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setPlaceName('');
    setSelectedType('custom');
    setCustomName('');
  };

  const handleSave = () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save locations.",
        variant: "destructive",
      });
      return;
    }

    const finalName = selectedType === 'custom' ? customName : placeName;
    if (!finalName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for this location.",
        variant: "destructive",
      });
      return;
    }

    createPlaceMutation.mutate({
      name: finalName,
      type: selectedType,
      lat: location.lat,
      lon: location.lon,
      address: location.label
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-[#6200D9]" />
            Save Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-6">
          {/* Authentication Warning */}
          {!userId && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-800">
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">Sign in required to save locations</span>
              </div>
            </div>
          )}

          {/* Location Preview */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{location.label}</span>
            </div>
            <div className="text-sm text-gray-600">
              {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </div>
          </div>

          {/* Place Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {PLACE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => userId && setSelectedType(type.key as any)}
                    disabled={!userId}
                    className={`p-3 rounded-2xl border-2 transition-all duration-200 touch-target ${
                      selectedType === type.key
                        ? 'border-[#6200D9] bg-[#6200D9]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">{type.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="place-name" className="text-sm font-semibold text-gray-700">
              {selectedType === 'custom' ? 'Custom Name' : 'Name'}
            </Label>
            <Input
              id="place-name"
              type="text"
              value={selectedType === 'custom' ? customName : placeName}
              onChange={(e) => {
                if (userId) {
                  if (selectedType === 'custom') {
                    setCustomName(e.target.value);
                  } else {
                    setPlaceName(e.target.value);
                  }
                }
              }}
              placeholder={selectedType === 'custom' ? 'Enter custom name...' : `Enter ${PLACE_TYPES.find(t => t.key === selectedType)?.label.toLowerCase()} name...`}
              className="h-11 text-sm rounded-2xl"
              disabled={!userId}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-4 sm:px-6 py-2 sm:py-3 touch-target order-2 sm:order-1 text-sm sm:text-base rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!userId || createPlaceMutation.isPending || !(selectedType === 'custom' ? customName.trim() : placeName.trim())}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#6200D9] to-[#4C00A8] text-white font-semibold touch-target order-1 sm:order-2 text-sm sm:text-base rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!userId ? 'Sign In Required' : createPlaceMutation.isPending ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
