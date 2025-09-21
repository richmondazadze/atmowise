"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Home,
  Briefcase,
  GraduationCap,
  Plus,
  Minus,
  Wind,
  Activity,
  Navigation,
} from "lucide-react";
import { motion } from "framer-motion";
import type { SavedPlace } from "@shared/schema";

interface SavedPlacesProps {
  userId: string;
  onLocationSelect: (location: {
    lat: number;
    lon: number;
    label: string;
  }) => void;
}

const PLACE_TYPES = {
  home: { icon: Home, label: "Home", color: "bg-blue-100 text-blue-800" },
  work: {
    icon: Briefcase,
    label: "Work",
    color: "bg-green-100 text-green-800",
  },
  school: {
    icon: GraduationCap,
    label: "School",
    color: "bg-orange-100 text-orange-800",
  },
  custom: { icon: MapPin, label: "Custom", color: "bg-gray-100 text-gray-800" },
  current: {
    icon: Navigation,
    label: "Current Location",
    color: "bg-purple-100 text-purple-800",
  },
};

export function SavedPlaces({ userId, onLocationSelect }: SavedPlacesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: "",
    type: "custom" as keyof typeof PLACE_TYPES,
    lat: 0,
    lon: 0,
    address: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch saved places
  const { data: savedPlaces = [], isLoading } = useQuery({
    queryKey: ["saved-places", userId],
    queryFn: async () => {
      const response = await fetch(`/api/saved-places?userId=${userId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!userId,
  });

  // Delete saved place mutation
  const deletePlaceMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const response = await fetch(`/api/saved-places/${placeId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete place");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-places", userId] });
      toast({
        title: "Place deleted",
        description: "The saved place has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceSelect = (place: SavedPlace) => {
    // Use address if it exists and is different from name, otherwise use name
    const displayLabel =
      place.address && place.address !== place.name
        ? place.address
        : place.name;

    onLocationSelect({
      lat: place.lat,
      lon: place.lon,
      label: displayLabel,
    });

    // Scroll to top when location is selected
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description:
          "Your browser doesn't support geolocation. Please enter coordinates manually.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Getting your location...",
      description: "Please allow location access to use your current position.",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect({
          lat: latitude,
          lon: longitude,
          label: "Current Location",
        });

        // Scroll to top when location is selected
        window.scrollTo({ top: 0, behavior: "smooth" });

        toast({
          title: "Location found!",
          description: "Using your current location for air quality data.",
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location. Please try again.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Location access denied. Please enable location permissions and try again.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable. Please try again.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Please try again.";
        }

        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleAddPlace = async () => {
    if (!newPlace.name.trim() || newPlace.lat === 0 || newPlace.lon === 0) {
      toast({
        title: "Invalid data",
        description: "Please provide a name and valid coordinates.",
        variant: "destructive",
      });
      return;
    }
    // Check for duplicate names
    const existingPlace = savedPlaces.find(
      (place: SavedPlace) =>
        place.name.toLowerCase() === newPlace.name.toLowerCase()
    );

    if (existingPlace) {
      toast({
        title: "Duplicate place",
        description:
          "A place with this name already exists. Please choose a different name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/saved-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPlace,
          userId,
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["saved-places", userId] });
        setNewPlace({ name: "", type: "custom", lat: 0, lon: 0, address: "" });
        setShowAddForm(false);
        toast({
          title: "Place saved",
          description: "Your new place has been saved successfully.",
        });
      } else {
        throw new Error("Failed to save place");
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="card-solid rounded-xl lg:rounded-2xl p-3 lg:p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6200D9]"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-solid rounded-xl lg:rounded-2xl p-1 lg:p-1 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg lg:text-xl font-bold text-[#0A1C40] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#6200D9]" />
            Saved Places
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Place
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add New Place Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-gray-50 rounded-xl border border-gray-200"
          >
            <h4 className="font-semibold text-[#0A1C40] mb-3">Add New Place</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#0A1C40] mb-1">
                  Place Name
                </label>
                <input
                  type="text"
                  value={newPlace.name}
                  onChange={(e) =>
                    setNewPlace((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., My Home, Office, Gym"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6200D9] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1C40] mb-1">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PLACE_TYPES).map(
                    ([key, { icon: Icon, label, color }]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setNewPlace((prev) => ({ ...prev, type: key as any }))
                        }
                        className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                          newPlace.type === key
                            ? "border-[#6200D9] bg-[#6200D9]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-xs font-medium">{label}</div>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#0A1C40] mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newPlace.lat || ""}
                    onChange={(e) =>
                      setNewPlace((prev) => ({
                        ...prev,
                        lat: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="40.7128"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6200D9] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1C40] mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newPlace.lon || ""}
                    onChange={(e) =>
                      setNewPlace((prev) => ({
                        ...prev,
                        lon: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="-74.0060"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6200D9] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1C40] mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={newPlace.address}
                  onChange={(e) =>
                    setNewPlace((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="e.g., 123 Main St, New York, NY"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6200D9] focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPlace}
                  className="px-4 py-2 bg-gradient-to-r from-[#6200D9] to-[#4C00A8] text-white font-semibold"
                >
                  Save Place
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved Places List */}
        {savedPlaces.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-[#64748B] mb-2 font-medium">
              No saved places yet
            </p>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Add your frequently visited locations for quick access
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto scroll-smooth overscroll-contain">
            {savedPlaces.map((place: any) => {
              const typeInfo =
                PLACE_TYPES[place.type as keyof typeof PLACE_TYPES] ||
                PLACE_TYPES.custom;
              const TypeIcon = typeInfo.icon;

              return (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#6200D9]/30 hover:shadow-md transition-all duration-200 cursor-pointer group touch-target"
                  onClick={() => handlePlaceSelect(place)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 ${typeInfo.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-[#0A1C40] dark:text-white group-hover:text-[#6200D9] transition-colors truncate">
                          {place.name}
                        </h4>
                        {typeInfo.label !== place.name && (
                          <Badge
                            variant="outline"
                            className="text-xs mt-1 dark:border-gray-600 dark:text-gray-300"
                          >
                            {typeInfo.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaceMutation.mutate(place.id);
                      }}
                      className="opacity-70 hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 touch-target flex-shrink-0 rounded-full w-8 h-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>

                  {place.address && (
                    <p className="text-sm text-[#64748B] dark:text-gray-400 mb-2 leading-relaxed">
                      {place.address}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-gray-400">
                    <span className="truncate">
                      {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                    </span>
                    <div className="flex items-center space-x-1 text-[#6200D9] dark:text-purple-400 flex-shrink-0">
                      <Wind className="h-3 w-3" />
                      <span>Check Air Quality</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Use Current Location Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="pt-2"
        >
          <Button
            variant="outline"
            onClick={handleUseCurrentLocation}
            className="w-full h-12 bg-gradient-to-r dark;border-1 border-white-300 from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 hover:border-purple-300 transition-all duration-200"
          >
            <Navigation className="h-5 w-5 mr-2 text-purple-600" />
            <span className="font-medium text-purple-700">
              Use Current Location
            </span>
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
