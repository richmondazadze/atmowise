'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, ChevronDown, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { getAirQualityForAddress, getAQIInfo } from '@/lib/airQualityMultiSource';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lon: number; label: string }, airQuality: any) => void;
  currentLocation?: { lat: number; lon: number; label: string };
  onUseCurrentLocation?: () => void;
  isCurrentLocationLoading?: boolean;
}

export function LocationPicker({ onLocationSelect, currentLocation, onUseCurrentLocation, isCurrentLocationLoading }: LocationPickerProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced suggestions fetching
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (address.length >= 2) {
        try {
          const response = await fetch(`/api/location/suggestions?q=${encodeURIComponent(address)}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.warn('Failed to fetch suggestions:', err);
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
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
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
    
    // Automatically search for air quality and select location
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/location/search?q=${encodeURIComponent(suggestion.formatted)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search location');
      }
      
      const result = await response.json();
      
      // Automatically select the location after getting air quality data
      onLocationSelect(result.location, result.airQuality);
      
      // Clear the form
      setAddress('');
      setSearchResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search location');
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
      const response = await fetch(`/api/location/search?q=${encodeURIComponent(address)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search location');
      }
      
      const result = await response.json();
      setSearchResults([result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search location');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (result: any) => {
    onLocationSelect(result.location, result.airQuality);
    setSearchResults([]);
    setAddress('');
  };

  const getAQIDisplay = (aqi: number | null) => {
    return getAQIInfo(aqi);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Search Air Quality by Location
        </CardTitle>
      </CardHeader>
            <CardContent className="space-y-4">
              {/* Use Current Location Button */}
              {onUseCurrentLocation && (
                <div className="flex justify-center mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onUseCurrentLocation}
                    disabled={isCurrentLocationLoading}
                    className="flex items-center gap-2 border-[#6200D9] text-[#6200D9] hover:bg-[#6200D9]/10 h-12 px-6 touch-target"
                  >
                    <MapPin className="h-4 w-4" />
                    {isCurrentLocationLoading ? 'Getting Location...' : 'Use Current Location'}
                  </Button>
                </div>
              )}
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => address.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking
                      setTimeout(() => {
                        setShowSuggestions(false);
                        setSelectedIndex(-1);
                      }, 200);
                    }}
                    placeholder="Start typing a city name (e.g., 'New York', 'London', 'Tokyo')"
                    className="pl-10 pr-10 h-12 text-base touch-target"
                    disabled={loading}
                  />
                  {address.length >= 2 && (
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                  
                  {/* Enhanced Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-sm"
                    >
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                          Suggested Locations
                        </div>
                        {suggestions.slice(0, 5).map((suggestion, index) => (
                        <div
                          key={`${suggestion.lat}-${suggestion.lon}`}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-[#6200D9]/5 hover:to-[#4C00A8]/5 hover:shadow-sm touch-target ${
                            index === selectedIndex ? 'bg-gradient-to-r from-[#6200D9]/10 to-[#4C00A8]/10 shadow-sm' : ''
                          }`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-[#6200D9] to-[#4C00A8] rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {suggestion.formatted}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {suggestion.lat.toFixed(4)}, {suggestion.lon.toFixed(4)}
                              </p>
                            </div>
                            {index === selectedIndex && (
                              <div className="w-6 h-6 bg-[#6200D9] rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading || !address.trim()} className="h-12 px-6 touch-target">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Search Results</h3>
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors touch-target"
                onClick={() => handleLocationSelect(result)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {result.location.label}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {result.location.lat.toFixed(4)}, {result.location.lon.toFixed(4)}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.airQuality.aqi && (
                            <>
                              <span className="text-gray-600">AQI:</span>
                              <Badge className={getAQIDisplay(result.airQuality.aqi).color}>
                                {result.airQuality.aqi} - {getAQIDisplay(result.airQuality.aqi).label}
                              </Badge>
                            </>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.source === 'openweather' ? 'OpenWeather' : 
                           result.source === 'airnow' ? 'AirNow (EPA)' : 
                           'Demo Data'}
                        </Badge>
                      </div>
                      
                      {result.airQuality.category && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span> {result.airQuality.category}
                        </div>
                      )}
                      
                      {result.airQuality.dominantPollutant && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Dominant Pollutant:</span> {result.airQuality.dominantPollutant}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        {result.airQuality.pm25 && (
                          <div className="text-gray-600">
                            PM2.5: <span className="font-medium">{result.airQuality.pm25} μg/m³</span>
                          </div>
                        )}
                        
                        {result.airQuality.pm10 && (
                          <div className="text-gray-600">
                            PM10: <span className="font-medium">{result.airQuality.pm10} μg/m³</span>
                          </div>
                        )}
                        
                        {result.airQuality.o3 && (
                          <div className="text-gray-600">
                            O₃: <span className="font-medium">{result.airQuality.o3} ppb</span>
                          </div>
                        )}
                        
                        {result.airQuality.no2 && (
                          <div className="text-gray-600">
                            NO₂: <span className="font-medium">{result.airQuality.no2} ppb</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationSelect(result);
                    }}
                    className="touch-target"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentLocation && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Current Location</p>
                <p className="text-sm text-blue-700">{currentLocation.label}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddress('');
                  setSearchResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
