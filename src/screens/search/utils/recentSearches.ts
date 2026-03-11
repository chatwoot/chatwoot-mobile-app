import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY_PREFIX = 'recentSearches';
const MAX_RECENT_SEARCHES = 3;

function getStorageKey(accountId: number): string {
  return `${RECENT_SEARCHES_KEY_PREFIX}:${accountId}`;
}

export const RecentSearches = {
  async get(accountId: number): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(accountId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async add(accountId: number, query: string): Promise<void> {
    if (!query || query.trim().length < 2) return;

    const trimmedQuery = query.trim();
    const searches = await this.get(accountId);

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

    await AsyncStorage.setItem(getStorageKey(accountId), JSON.stringify(limitedSearches));
  },

  async clear(accountId: number): Promise<void> {
    await AsyncStorage.removeItem(getStorageKey(accountId));
  },
};
