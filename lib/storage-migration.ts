/**
 * Storage migration system for handling data structure changes
 * Provides versioned migrations and data transformation utilities
 */

import { storage } from './storage';

export interface Migration {
  version: string;
  description: string;
  up: () => void;
  down?: () => void;
}

export interface MigrationResult {
  success: boolean;
  migrated: string[];
  errors: string[];
}

class StorageMigrationManager {
  private migrations: Migration[] = [];
  private currentVersion: string = '1.0.0';

  constructor() {
    this.registerMigrations();
  }

  private registerMigrations() {
    // Migration from old localStorage format to new storage format
    this.addMigration({
      version: '1.0.0',
      description: 'Migrate from old localStorage format to new storage format',
      up: () => {
        this.migrateOldLocationFormat();
        this.migrateOldThemeFormat();
        this.migrateOldPreferencesFormat();
      },
    });

    // Future migrations can be added here
    // this.addMigration({
    //   version: '1.1.0',
    //   description: 'Add new user preferences structure',
    //   up: () => {
    //     // Migration logic
    //   },
    // });
  }

  private addMigration(migration: Migration) {
    this.migrations.push(migration);
  }

  private migrateOldLocationFormat() {
    try {
      // Check if old format exists
      const oldLocation = localStorage.getItem('atmowise-selected-location');
      if (oldLocation) {
        const location = JSON.parse(oldLocation);
        if (location && typeof location === 'object' && 'lat' in location && 'lon' in location) {
          // Migrate to new format
          storage.setSelectedLocation(location);
          console.log('Migrated old location format to new storage format');
        }
      }
    } catch (error) {
      console.warn('Failed to migrate old location format:', error);
    }
  }

  private migrateOldThemeFormat() {
    try {
      // Check if old format exists
      const oldTheme = localStorage.getItem('atmowise-dark-mode');
      if (oldTheme !== null) {
        const isDark = oldTheme === 'true';
        storage.setDarkMode(isDark);
        console.log('Migrated old theme format to new storage format');
      }
    } catch (error) {
      console.warn('Failed to migrate old theme format:', error);
    }
  }

  private migrateOldPreferencesFormat() {
    try {
      // Check for any old preference keys and migrate them
      const oldKeys = [
        'atmowise-timeline-period',
        'atmowise-timeline-metric',
        'atmowise-user-preferences',
      ];

      oldKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            const newKey = key.replace('atmowise-', '');
            
            // Store in new format
            if (newKey === 'timeline-period') {
              storage.setTimelinePeriod(parsed);
            } else if (newKey === 'timeline-metric') {
              storage.setTimelineMetric(parsed);
            } else if (newKey === 'user-preferences') {
              storage.setUserPreferences(parsed);
            }
            
            console.log(`Migrated ${key} to new storage format`);
          } catch (error) {
            console.warn(`Failed to migrate ${key}:`, error);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to migrate old preferences format:', error);
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrated: [],
      errors: [],
    };

    try {
      const lastVersion = this.getLastMigrationVersion();
      const pendingMigrations = this.getPendingMigrations(lastVersion);

      for (const migration of pendingMigrations) {
        try {
          console.log(`Running migration ${migration.version}: ${migration.description}`);
          migration.up();
          result.migrated.push(migration.version);
          this.setLastMigrationVersion(migration.version);
        } catch (error) {
          console.error(`Migration ${migration.version} failed:`, error);
          result.errors.push(`${migration.version}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.success = false;
        }
      }

      if (result.migrated.length > 0) {
        console.log(`Successfully migrated ${result.migrated.length} storage versions`);
      }
    } catch (error) {
      console.error('Migration process failed:', error);
      result.success = false;
      result.errors.push(`Migration process: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private getLastMigrationVersion(): string {
    return localStorage.getItem('atmowise-migration-version') || '0.0.0';
  }

  private setLastMigrationVersion(version: string): void {
    localStorage.setItem('atmowise-migration-version', version);
  }

  private getPendingMigrations(lastVersion: string): Migration[] {
    return this.migrations.filter(migration => 
      this.compareVersions(migration.version, lastVersion) > 0
    );
  }

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  /**
   * Get migration status
   */
  getStatus() {
    const lastVersion = this.getLastMigrationVersion();
    const pendingMigrations = this.getPendingMigrations(lastVersion);
    
    return {
      currentVersion: this.currentVersion,
      lastMigratedVersion: lastVersion,
      pendingMigrations: pendingMigrations.length,
      migrations: this.migrations.map(m => ({
        version: m.version,
        description: m.description,
        pending: this.compareVersions(m.version, lastVersion) > 0,
      })),
    };
  }

  /**
   * Reset migration state (for testing)
   */
  resetMigrationState() {
    localStorage.removeItem('atmowise-migration-version');
  }
}

// Create singleton instance
export const storageMigration = new StorageMigrationManager();

// Auto-run migrations on import (in browser environment)
if (typeof window !== 'undefined') {
  storageMigration.runMigrations().then(result => {
    if (result.success) {
      console.log('Storage migrations completed successfully');
    } else {
      console.warn('Storage migrations completed with errors:', result.errors);
    }
  });
}
