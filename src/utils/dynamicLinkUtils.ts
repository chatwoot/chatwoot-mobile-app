import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DynamicLinkContext {
  conversationId: number;
  primaryActorId?: number;
  primaryActorType?: string;
  ref?: string;
}

const STORAGE_KEY = 'pendingDynamicLink';

export async function storePendingLink(context: DynamicLinkContext): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch (error) {
    // noop
  }
}

export async function loadAndClearPendingLink(): Promise<DynamicLinkContext | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    await AsyncStorage.removeItem(STORAGE_KEY);
    return JSON.parse(data) as DynamicLinkContext;
  } catch (error) {
    return null;
  }
}


