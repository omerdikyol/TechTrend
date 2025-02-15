import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class CacheService {
  private static readonly CACHE_PREFIX = '@TechTrend:cache:';
  private static readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  static async set<T>(key: string, data: T, expiryMs: number = this.DEFAULT_EXPIRY): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };

    try {
      await AsyncStorage.setItem(
        this.CACHE_PREFIX + key,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  static async get<T>(key: string, expiryMs: number = this.DEFAULT_EXPIRY): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const age = Date.now() - cacheItem.timestamp;

      if (age > expiryMs) {
        // Cache expired, remove it
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}
