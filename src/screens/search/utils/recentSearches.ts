import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 3;

export const RecentSearches = {
  async get(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async add(query: string): Promise<void> {
    if (!query || query.trim().length < 2) return;

    const trimmedQuery = query.trim();
    const searches = await this.get();

    // Remove if already exists
    const existingIndex = searches.findIndex(
      search => search.toLowerCase() === trimmedQuery.toLowerCase(),
    );
    if (existingIndex !== -1) {
      searches.splice(existingIndex, 1);
    }

    // Add to beginning
    searches.unshift(trimmedQuery);

    // Keep only max items
    const limitedSearches = searches.slice(0, MAX_RECENT_SEARCHES);

    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limitedSearches));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  },
};
