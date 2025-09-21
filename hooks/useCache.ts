/**
 * Cache management hook for improved performance
 * Provides intelligent caching with TTL, invalidation, and memory management
 */

import { useCallback, useRef, useEffect } from 'react';
import { storage } from '@/lib/storage';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  strategy?: 'lru' | 'fifo' | 'ttl'; // Cache eviction strategy
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export function useCache<T = any>(key: string, options: CacheOptions = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100,
    strategy = 'lru'
  } = options;

  const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map());
  const cacheKey = `cache-${key}`;

  // Load cache from storage on mount
  useEffect(() => {
    const cachedData = storage.getCachedData<Map<string, CacheItem<T>>>(cacheKey);
    if (cachedData) {
      cacheRef.current = new Map(cachedData);
    }
  }, [cacheKey]);

  // Save cache to storage when it changes
  useEffect(() => {
    const saveCache = () => {
      const cacheData = Array.from(cacheRef.current.entries());
      storage.setCachedData(cacheKey, cacheData, ttl);
    };

    const interval = setInterval(saveCache, 30 * 1000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [cacheKey, ttl]);

  const isExpired = useCallback((item: CacheItem<T>): boolean => {
    return Date.now() - item.timestamp > ttl;
  }, [ttl]);

  const evictItem = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  const evictExpired = useCallback(() => {
    for (const [key, item] of Array.from(cacheRef.current.entries())) {
      if (isExpired(item)) {
        evictItem(key);
      }
    }
  }, [isExpired, evictItem]);

  const evictByStrategy = useCallback(() => {
    if (cacheRef.current.size <= maxSize) return;

    const items = Array.from(cacheRef.current.entries());
    
    switch (strategy) {
      case 'lru':
        // Least Recently Used
        items.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        break;
      case 'fifo':
        // First In, First Out
        items.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
      case 'ttl':
        // Time To Live (expired items first)
        items.sort((a, b) => {
          const aExpired = isExpired(a[1]);
          const bExpired = isExpired(b[1]);
          if (aExpired && !bExpired) return -1;
          if (!aExpired && bExpired) return 1;
          return a[1].timestamp - b[1].timestamp;
        });
        break;
    }

    // Remove excess items
    const toRemove = items.slice(0, items.length - maxSize);
    toRemove.forEach(([key]) => evictItem(key));
  }, [maxSize, strategy, isExpired, evictItem]);

  const get = useCallback((itemKey: string): T | null => {
    evictExpired();
    
    const item = cacheRef.current.get(itemKey);
    if (!item) return null;

    // Update access info
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.data;
  }, [evictExpired]);

  const set = useCallback((itemKey: string, data: T): void => {
    evictExpired();
    evictByStrategy();

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    cacheRef.current.set(itemKey, item);
  }, [evictExpired, evictByStrategy]);

  const has = useCallback((itemKey: string): boolean => {
    evictExpired();
    return cacheRef.current.has(itemKey);
  }, [evictExpired]);

  const remove = useCallback((itemKey: string): boolean => {
    return cacheRef.current.delete(itemKey);
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  const getStats = useCallback(() => {
    evictExpired();
    
    const items = Array.from(cacheRef.current.values());
    const totalAccess = items.reduce((sum, item) => sum + item.accessCount, 0);
    const avgAccess = items.length > 0 ? totalAccess / items.length : 0;
    
    return {
      size: cacheRef.current.size,
      maxSize,
      totalAccess,
      avgAccess,
      hitRate: totalAccess > 0 ? (totalAccess - items.length) / totalAccess : 0,
    };
  }, [maxSize, evictExpired]);

  return {
    get,
    set,
    has,
    remove,
    clear,
    getStats,
    isExpired: (itemKey: string) => {
      const item = cacheRef.current.get(itemKey);
      return item ? isExpired(item) : false;
    },
  };
}

// Specialized cache hooks for common use cases
export function useAirQualityCache() {
  return useCache<any>('air-quality', {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 50,
    strategy: 'lru'
  });
}

export function useLocationCache() {
  return useCache<any>('locations', {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 20,
    strategy: 'lru'
  });
}

export function useTimelineCache() {
  return useCache<any>('timeline', {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 30,
    strategy: 'lru'
  });
}

export function useUserDataCache() {
  return useCache<any>('user-data', {
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 10,
    strategy: 'lru'
  });
}
