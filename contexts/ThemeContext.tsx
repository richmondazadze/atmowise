'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLargeFont: boolean;
  toggleLargeFont: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  // Load theme preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('atmowise-dark-mode') === 'true';
    const savedLargeFont = localStorage.getItem('atmowise-large-font') === 'true';
    
    setIsDarkMode(savedDarkMode);
    setIsLargeFont(savedLargeFont);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Apply font size to document
  useEffect(() => {
    if (isLargeFont) {
      document.documentElement.classList.add('large-font');
    } else {
      document.documentElement.classList.remove('large-font');
    }
  }, [isLargeFont]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('atmowise-dark-mode', newDarkMode.toString());
  };

  const toggleLargeFont = () => {
    const newLargeFont = !isLargeFont;
    setIsLargeFont(newLargeFont);
    localStorage.setItem('atmowise-large-font', newLargeFont.toString());
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      isLargeFont,
      toggleLargeFont
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

