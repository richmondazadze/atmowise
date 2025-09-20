'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationContextType {
  currentLocation: { lat: number; lon: number; label: string } | null;
  selectedLocation: { lat: number; lon: number; label: string } | null;
  locationPermission: boolean;
  locationLoading: boolean;
  setSelectedLocation: (location: { lat: number; lon: number; label: string } | null) => void;
  requestLocationPermission: () => Promise<void>;
  updateCurrentLocation: (lat: number, lon: number, label?: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('atmowise-selected-location');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setSelectedLocation(location);
      } catch (error) {
        console.warn('Failed to parse saved location:', error);
      }
    }
  }, []);

  // Save location to localStorage when it changes
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem('atmowise-selected-location', JSON.stringify(selectedLocation));
    }
  }, [selectedLocation]);

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Get a readable address for the current location
      try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const location = data[0];
            const label = `${location.name}, ${location.state || location.country}`;
            setCurrentLocation({ lat: latitude, lon: longitude, label });
            setSelectedLocation({ lat: latitude, lon: longitude, label });
          } else {
            setCurrentLocation({ lat: latitude, lon: longitude, label: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` });
            setSelectedLocation({ lat: latitude, lon: longitude, label: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` });
          }
        } else {
          setCurrentLocation({ lat: latitude, lon: longitude, label: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` });
          setSelectedLocation({ lat: latitude, lon: longitude, label: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` });
        }
      } catch (error) {
        console.warn('Failed to get address for current location:', error);
        setCurrentLocation({ lat: latitude, lon: longitude, label: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` });
        setSelectedLocation({ lat: latitude, lon: longitude, label: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` });
      }

      setLocationPermission(true);
    } catch (error) {
      console.warn('Location permission denied or failed:', error);
      setLocationPermission(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const updateCurrentLocation = async (lat: number, lon: number, label?: string) => {
    let locationLabel = label;
    
    // If no label provided, try to get a readable address
    if (!locationLabel) {
      try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const location = data[0];
            locationLabel = `${location.name}, ${location.state || location.country}`;
          }
        }
      } catch (error) {
        console.warn('Failed to get address for current location:', error);
      }
      
      // Fallback to coordinates if geocoding fails
      if (!locationLabel) {
        locationLabel = `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
      }
    }
    
    setCurrentLocation({ lat, lon, label: locationLabel });
    setSelectedLocation({ lat, lon, label: locationLabel });
  };

  return (
    <LocationContext.Provider value={{
      currentLocation,
      selectedLocation,
      locationPermission,
      locationLoading,
      setSelectedLocation,
      requestLocationPermission,
      updateCurrentLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
