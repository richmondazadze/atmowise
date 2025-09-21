/**
 * Centralized storage utility for localStorage and sessionStorage
 * Provides type-safe storage with error handling, validation, and migration support
 */

export type StorageType = 'localStorage' | 'sessionStorage';

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  version: string;
}

export interface StorageConfig {
  type: StorageType;
  version: string;
  defaultTTL?: number; // Time to live in milliseconds
  encrypt?: boolean;
}

export class StorageManager {
  private config: StorageConfig;
  private prefix: string = 'atmowise-';

  constructor(config: StorageConfig) {
    this.config = config;
  }

  private getStorage(): Storage {
    if (typeof window === 'undefined') {
      throw new Error('Storage is not available in server-side environment');
    }
    return this.config.type === 'localStorage' ? localStorage : sessionStorage;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(item: StorageItem, ttl?: number): boolean {
    if (!ttl) return false;
    return Date.now() - item.timestamp > ttl;
  }

  private validateVersion(item: StorageItem): boolean {
    return item.version === this.config.version;
  }

  /**
   * Set an item in storage with metadata
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const storage = this.getStorage();
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        version: this.config.version,
      };

      const serialized = JSON.stringify(item);
      storage.setItem(this.getKey(key), serialized);
      return true;
    } catch (error) {
      console.error(`Failed to set storage item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get an item from storage with validation
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const storage = this.getStorage();
      const serialized = storage.getItem(this.getKey(key));
      
      if (!serialized) {
        return defaultValue ?? null;
      }

      const item: StorageItem<T> = JSON.parse(serialized);
      
      // Check if item is expired
      const ttl = this.config.defaultTTL;
      if (this.isExpired(item, ttl)) {
        this.remove(key);
        return defaultValue ?? null;
      }

      // Check version compatibility
      if (!this.validateVersion(item)) {
        console.warn(`Storage item ${key} has incompatible version. Expected: ${this.config.version}, Got: ${item.version}`);
        // Optionally migrate or remove incompatible data
        this.remove(key);
        return defaultValue ?? null;
      }

      return item.value;
    } catch (error) {
      console.error(`Failed to get storage item ${key}:`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Remove an item from storage
   */
  remove(key: string): boolean {
    try {
      const storage = this.getStorage();
      storage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Failed to remove storage item ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all items with the prefix
   */
  clear(): boolean {
    try {
      const storage = this.getStorage();
      const keys = Object.keys(storage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => storage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get all keys with the prefix
   */
  keys(): string[] {
    try {
      const storage = this.getStorage();
      return Object.keys(storage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Failed to get storage keys:', error);
      return [];
    }
  }

  /**
   * Check if a key exists
   */
  has(key: string): boolean {
    try {
      const storage = this.getStorage();
      return storage.getItem(this.getKey(key)) !== null;
    } catch (error) {
      console.error(`Failed to check storage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  getStats(): { used: number; available: number; percentage: number } {
    try {
      const storage = this.getStorage();
      let used = 0;
      
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          used += storage[key].length;
        }
      }

      // Estimate available space (this is approximate)
      const available = 5 * 1024 * 1024 - used; // 5MB estimate
      const percentage = (used / (5 * 1024 * 1024)) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Create storage instances
export const localStorage = new StorageManager({
  type: 'localStorage',
  version: '1.0.0',
  defaultTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
});

export const sessionStorage = new StorageManager({
  type: 'sessionStorage',
  version: '1.0.0',
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
});

// Storage keys constants
export const STORAGE_KEYS = {
  SELECTED_LOCATION: 'selected-location',
  DARK_MODE: 'dark-mode',
  USER_PREFERENCES: 'user-preferences',
  TIMELINE_PERIOD: 'timeline-period',
  TIMELINE_METRIC: 'timeline-metric',
  LAST_AIR_QUALITY: 'last-air-quality',
  CACHED_LOCATIONS: 'cached-locations',
  APP_STATE: 'app-state',
} as const;

// Type definitions for stored data
export interface SelectedLocation {
  lat: number;
  lon: number;
  label: string;
  timestamp?: number;
}

export interface UserPreferences {
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  defaultView: 'dashboard' | 'timeline' | 'profile';
  theme: 'light' | 'dark' | 'auto';
}

export interface AppState {
  lastActiveTab: string;
  sidebarCollapsed: boolean;
  welcomeShown: boolean;
}

// Convenience functions for common storage operations
export const storage = {
  // Location
  setSelectedLocation: (location: SelectedLocation) => 
    localStorage.set(STORAGE_KEYS.SELECTED_LOCATION, location),
  
  getSelectedLocation: (): SelectedLocation | null => 
    localStorage.get<SelectedLocation>(STORAGE_KEYS.SELECTED_LOCATION),
  
  // Theme
  setDarkMode: (isDark: boolean) => 
    localStorage.set(STORAGE_KEYS.DARK_MODE, isDark),
  
  getDarkMode: (): boolean => 
    localStorage.get<boolean>(STORAGE_KEYS.DARK_MODE, false),
  
  // User preferences
  setUserPreferences: (preferences: Partial<UserPreferences>) => {
    const current = localStorage.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {
      notifications: true,
      autoRefresh: true,
      refreshInterval: 5,
      defaultView: 'dashboard',
      theme: 'auto',
    });
    return localStorage.set(STORAGE_KEYS.USER_PREFERENCES, { ...current, ...preferences });
  },
  
  getUserPreferences: (): UserPreferences => 
    localStorage.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {
      notifications: true,
      autoRefresh: true,
      refreshInterval: 5,
      defaultView: 'dashboard',
      theme: 'auto',
    }),
  
  // Timeline
  setTimelinePeriod: (period: string) => 
    localStorage.set(STORAGE_KEYS.TIMELINE_PERIOD, period),
  
  getTimelinePeriod: (): string => 
    localStorage.get<string>(STORAGE_KEYS.TIMELINE_PERIOD, '7d'),
  
  setTimelineMetric: (metric: string) => 
    localStorage.set(STORAGE_KEYS.TIMELINE_METRIC, metric),
  
  getTimelineMetric: (): string => 
    localStorage.get<string>(STORAGE_KEYS.TIMELINE_METRIC, 'aqi'),
  
  // App state
  setAppState: (state: Partial<AppState>) => {
    const current = localStorage.get<AppState>(STORAGE_KEYS.APP_STATE, {
      lastActiveTab: 'dashboard',
      sidebarCollapsed: false,
      welcomeShown: false,
    });
    return localStorage.set(STORAGE_KEYS.APP_STATE, { ...current, ...state });
  },
  
  getAppState: (): AppState => 
    localStorage.get<AppState>(STORAGE_KEYS.APP_STATE, {
      lastActiveTab: 'dashboard',
      sidebarCollapsed: false,
      welcomeShown: false,
    }),
  
  // Cache management
  setCachedData: <T>(key: string, data: T, ttl?: number) => 
    localStorage.set(key, data, ttl),
  
  getCachedData: <T>(key: string, defaultValue?: T) => 
    localStorage.get<T>(key, defaultValue),
  
  clearCache: () => {
    const keys = localStorage.keys();
    const cacheKeys = keys.filter(key => key.startsWith('cache-'));
    cacheKeys.forEach(key => localStorage.remove(key));
  },
  
  // Cleanup
  clearAll: () => localStorage.clear(),
};
