import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, Assignment } from '../types';

const KEYS = {
  USER_PREFERENCES: '@assignmate_user_preferences',
  CACHED_ASSIGNMENTS: '@assignmate_cached_assignments',
  LAST_SYNC: '@assignmate_last_sync',
};

export const StorageService = {
  // User Preferences
  saveUserPreferences: async (preferences: UserPreferences): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  },

  getUserPreferences: async (): Promise<UserPreferences | null> => {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  },

  // Cache Assignments
  cacheAssignments: async (assignments: Assignment[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        KEYS.CACHED_ASSIGNMENTS,
        JSON.stringify(assignments)
      );
      await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error caching assignments:', error);
    }
  },

  getCachedAssignments: async (): Promise<Assignment[]> => {
    try {
      const data = await AsyncStorage.getItem(KEYS.CACHED_ASSIGNMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cached assignments:', error);
      return [];
    }
  },

  getLastSyncTime: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        KEYS.USER_PREFERENCES,
        KEYS.CACHED_ASSIGNMENTS,
        KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};