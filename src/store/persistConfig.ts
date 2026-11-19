import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import type { Reducer } from '@reduxjs/toolkit';
import { getStoredState, persistReducer, type PersistedState } from 'redux-persist';
import authSlice from '@/store/auth/authSlice';
import settingsSlice from '@/store/settings/settingsSlice';
import { repairPersistedWebSocketUrl } from '@/store/settings/settingsUtils';

export const ROOT_PERSIST_KEY = 'Root';
export const ROOT_PERSIST_VERSION = 2;

export const SESSION_SLICES = ['auth', 'settings'] as const;
type SessionSlice = (typeof SESSION_SLICES)[number];

let rootRead: Promise<string | null> | undefined;

/**
 * Reads the root entry once per launch. The session configs fall back to the
 * same snapshot, so they never observe a root entry already rewritten without
 * the session slices.
 */
const readRoot = () => {
  rootRead ??= AsyncStorage.getItem(`persist:${ROOT_PERSIST_KEY}`);
  return rootRead;
};

const parseRoot = (raw: string): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(JSON.parse(raw) as Record<string, string>).map(([key, value]) => [
      key,
      JSON.parse(value),
    ]),
  );

/**
 * Android cannot read a value larger than its ~2 MB cursor window, so a large
 * cache fails to load here. redux-persist then starts the root slices empty.
 */
export const getRootStoredState = async () => {
  try {
    const raw = await readRoot();
    return raw ? parseRoot(raw) : undefined;
  } catch (error) {
    Sentry.captureException(error, { tags: { persistKey: ROOT_PERSIST_KEY } });
    throw error;
  }
};

// A failed root read is reported by getRootStoredState.
const readSliceFromRoot = async (key: SessionSlice) => {
  try {
    const raw = await readRoot();
    const root = raw ? parseRoot(raw) : undefined;
    const version = (root?._persist as { version?: number } | undefined)?.version ?? 0;
    return version >= ROOT_PERSIST_VERSION ? root?.[key] : undefined;
  } catch {
    return undefined;
  }
};

export const withoutSessionSlices = <T extends Record<string, unknown>>(state: T) => {
  const rest: Record<string, unknown> = { ...state };
  SESSION_SLICES.forEach(key => delete rest[key]);
  return rest as Omit<T, SessionSlice>;
};

/**
 * Persists a session slice under its own key so it survives a root entry that
 * cannot be read. Installs that predate the split restore it from the root entry.
 */
const persistSessionReducer = <S>(
  key: SessionSlice,
  reducer: Reducer<S>,
  repair: (state: S) => S = state => state,
) =>
  persistReducer<S>(
    {
      key,
      storage: AsyncStorage,
      getStoredState: async config =>
        ((await getStoredState(config)) ?? (await readSliceFromRoot(key))) as PersistedState,
      migrate: async state => (state ? (repair(state as S) as S & PersistedState) : state),
    },
    reducer,
  );

export const persistedAuthSlice = persistSessionReducer('auth', authSlice);

export const persistedSettingsSlice = persistSessionReducer(
  'settings',
  settingsSlice,
  repairPersistedWebSocketUrl,
);
