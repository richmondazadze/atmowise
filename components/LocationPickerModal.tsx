"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Loader2,
  X,
  ChevronDown,
  Check,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  getAirQualityForAddress,
  getAQIInfo,
} from "@/lib/airQualityMultiSource";
import { SaveLocationModal } from "./SaveLocationModal";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (
    location: { lat: number; lon: number; label: string },
    airQuality: any
  ) => void;
  currentLocation?: { lat: number; lon: number; label: string };
  onUseCurrentLocation?: () => void;
  isCurrentLocationLoading?: boolean;
  userId?: string;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation,
  onUseCurrentLocation,
  isCurrentLocationLoading,
  userId,
}: LocationPickerModalProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedLocationForSave, setSelectedLocationForSave] = useState<{
    lat: number;
    lon: number;
    label: string;
  } | null>(null);

  // Clean up state when main modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowSaveModal(false);
      setSelectedLocationForSave(null);
    }
  }, [isOpen]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced suggestions fetching
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (address.length >= 2) {
        try {
          const response = await fetch(
            `/api/location/suggestions?q=${encodeURIComponent(address)}`
          );
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.warn("Failed to fetch suggestions:", err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [address]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionSelect = async (suggestion: any) => {
    setAddress(suggestion.formatted);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]); // Clear suggestions

    // Search for air quality data and show in modal
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(
        `/api/location/search?q=${encodeURIComponent(suggestion.formatted)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to search location");
      }

      const result = await response.json();

      // Show preview data in modal - don't auto-select
      setSearchResults([result]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search location"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `/api/location/search?q=${encodeURIComponent(address)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to search location");
      }

      const result = await response.json();
      setSearchResults([result]);

      // Show preview data in modal - don't auto-select
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search location"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (result: any) => {
    onLocationSelect(result.location, result.airQuality);
    setSearchResults([]);
    setAddress("");
    onClose();
  };

  const handleSaveLocation = (result: any) => {
    setSelectedLocationForSave(result.location);
    setShowSaveModal(true);
  };

  const getAQIDisplay = (aqi: number | null) => {
    return getAQIInfo(aqi);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#6200D9]" />
              Select Location
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4">
            {/* Use Current Location Button */}
            {onUseCurrentLocation && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onUseCurrentLocation}
                  disabled={isCurrentLocationLoading}
                  className="flex items-center gap-2 border-[#6200D9] text-[#6200D9] hover:bg-[#6200D9]/10 h-12 px-6 w-full rounded-2xl"
                >
                  <MapPin className="h-4 w-4" />
                  {isCurrentLocationLoading
                    ? "Getting Location..."
                    : "Use Current Location"}
                </Button>
              </div>
            )}

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for a city or address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                  className="pl-10 h-12 text-base rounded-2xl"
                  autoComplete="off"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto scroll-smooth overscroll-contain"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                          index === selectedIndex ? "bg-[#6200D9]/10" : ""
                        }`}
                      >
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {suggestion.label}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {suggestion.lat.toFixed(4)},{" "}
                            {suggestion.lon.toFixed(4)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading || !address.trim()}
                className="h-12 px-6 bg-[#6200D9] hover:bg-[#4C00A8] rounded-2xl"
              >
                {loading ? (
                  <Loader2 className="text-white h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Search Results</h3>
                {searchResults.map((result, index) => {
                  const aqiInfo = getAQIDisplay(result.airQuality?.aqi);
                  return (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {result.location.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {result.location.lat.toFixed(4)},{" "}
                            {result.location.lon.toFixed(4)}
                          </div>
                          {result.airQuality && (
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`text-xs px-2 py-1 ${aqiInfo.color}`}
                              >
                                AQI {result.airQuality.aqi}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {aqiInfo.label}
                              </span>
                            </div>
                          )}
                        </div>
                        <Check className="h-5 w-5 text-[#6200D9]" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleLocationSelect(result)}
                          className="flex-1 h-10 bg-[#6200D9] hover:bg-[#4C00A8] text-white text-sm rounded-2xl"
                        >
                          Select Location
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveLocation(result);
                          }}
                          variant="outline"
                          disabled={!userId}
                          className="h-10 px-3 border-[#6200D9] text-[#6200D9] hover:bg-[#6200D9]/10 text-sm rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            !userId
                              ? "Sign in to save locations"
                              : "Save this location"
                          }
                        >
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Location Modal - Outside main dialog to prevent stacking issues */}
      {selectedLocationForSave && userId && (
        <SaveLocationModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            // Don't reset selectedLocationForSave here to prevent parent modal from closing
          }}
          location={selectedLocationForSave}
          userId={userId}
        />
      )}
    </>
  );
}
