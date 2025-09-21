/**
 * Cache management component for debugging and monitoring
 * Provides cache statistics and management controls
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, RefreshCw, Database, Activity, X } from 'lucide-react';
import { storage } from '@/lib/storage';

interface CacheStats {
  used: number;
  available: number;
  percentage: number;
}

export function CacheManager() {
  const [stats, setStats] = useState<CacheStats>({ used: 0, available: 0, percentage: 0 });
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const updateStats = () => {
    const storageStats = storage.getStats();
    setStats(storageStats);
    setCacheKeys(storage.keys());
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    storage.clearCache();
    updateStats();
  };

  const handleClearAll = () => {
    storage.clearAll();
    updateStats();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-40 opacity-50 hover:opacity-100"
      >
        <Database className="h-4 w-4 mr-2" />
        Cache
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 max-h-96 overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cache Manager
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 touch-target"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Storage Usage</span>
            <span className="font-medium">{formatBytes(stats.used)}</span>
          </div>
          <Progress value={stats.percentage} className="h-2" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.percentage.toFixed(1)}% of estimated 5MB
          </div>
        </div>

        {/* Cache Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cache Items</span>
            <Badge variant="outline">{cacheKeys.length}</Badge>
          </div>
          
          {cacheKeys.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {cacheKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded px-2 py-1"
                >
                  <span className="truncate flex-1">{key}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      storage.remove(key);
                      updateStats();
                    }}
                    className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="flex-1"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear Cache
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>

        {/* Cache Performance */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Activity className="h-3 w-3" />
            <span>Auto-cleanup enabled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
