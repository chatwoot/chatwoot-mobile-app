import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from '@/i18n';
// @ts-expect-error semver package lacks TypeScript definitions
import semver from 'semver';

import { presentAppStorePage } from '../../modules/app-update';

export const APP_PACKAGE_NAME = 'com.chatwoot.app';
export const APP_STORE_ID = '1495796682';

const SNOOZE_DAYS = 3;

let hasSignedInThisSession = false;

// Update prompts skip the sign-in launch so they don't stack on onboarding prompts.
export const markSignedInThisSession = (): void => {
  hasSignedInThisSession = true;
};

export const wasSignedInThisSession = (): boolean => hasSignedInThisSession;

let resolveServerPolicyLoaded: () => void = () => {};
const serverPolicyLoaded = new Promise<void>(resolve => {
  resolveServerPolicyLoaded = resolve;
});

const serverPolicyListeners = new Set<() => void>();

export const markServerPolicyLoaded = (): void => {
  resolveServerPolicyLoaded();
  serverPolicyListeners.forEach(listener => listener());
};

export const waitForServerPolicy = (): Promise<void> => serverPolicyLoaded;

export const onServerPolicyLoaded = (listener: () => void): (() => void) => {
  serverPolicyListeners.add(listener);
  return () => {
    serverPolicyListeners.delete(listener);
  };
};

let resolveNotificationRequestSettled: () => void = () => {};
const notificationRequestSettled = new Promise<void>(resolve => {
  resolveNotificationRequestSettled = resolve;
});

export const markNotificationRequestSettled = (): void => resolveNotificationRequestSettled();

export const waitForNotificationRequest = (): Promise<void> => notificationRequestSettled;
const SNOOZED_UNTIL_KEY = 'appUpdate.snoozedUntil';
const RESTARTED_FROM_VERSION_KEY = 'appUpdate.restartedFromVersion';

const toSemver = (version?: string | null): string | null => {
  if (!version) return null;
  return semver.valid(version) ?? semver.valid(semver.coerce(version)) ?? null;
};

// Invalid input compares as false.
export const isVersionLower = (version?: string | null, target?: string | null): boolean => {
  const current = toSemver(version);
  const other = toSemver(target);
  if (!current || !other) return false;
  return semver.lt(current, other);
};

export type MobileAppMinVersions = { ios?: string | null; android?: string | null };

export const getMinVersionForPlatform = (
  minVersions: MobileAppMinVersions | null | undefined,
  platform: string = Platform.OS,
): string | null => {
  const value = platform === 'ios' ? minVersions?.ios : minVersions?.android;
  return toSemver(value) ? (value as string) : null;
};

export const getStoreName = (): string =>
  i18n.t(Platform.OS === 'ios' ? 'APP_UPDATE.STORE_NAME.IOS' : 'APP_UPDATE.STORE_NAME.ANDROID');

// Keeps version numbers LTR inside RTL strings.
export const isolateBidi = (text: string): string => `⁨${text}⁩`;

export type AppStoreRelease = {
  version: string;
  minimumOsVersion: string;
};

export const fetchAppStoreRelease = async (): Promise<AppStoreRelease | null> => {
  const url = `https://itunes.apple.com/lookup?id=${APP_STORE_ID}&_=${Date.now()}`;
  const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
  if (!response.ok) {
    throw new Error(`App Store lookup failed with status ${response.status}`);
  }
  const data = await response.json();
  const result = data?.results?.[0];
  if (!result?.version) return null;
  return {
    version: result.version,
    minimumOsVersion: result.minimumOsVersion ?? '0',
  };
};

export const canInstallRelease = (release: AppStoreRelease, osVersion: string): boolean =>
  !isVersionLower(osVersion, release.minimumOsVersion);

export const isUpdatePromptSnoozed = async (now: number = Date.now()): Promise<boolean> => {
  const value = await AsyncStorage.getItem(SNOOZED_UNTIL_KEY);
  return value !== null && Number(value) > now;
};

export const snoozeUpdatePrompt = async (now: number = Date.now()): Promise<void> => {
  const until = now + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  await AsyncStorage.setItem(SNOOZED_UNTIL_KEY, String(until));
};

// Marker writes wait for this read so its removal can't delete a newer marker.
let pendingMarkerRead: Promise<unknown> = Promise.resolve();

export const markRestartForUpdate = async (currentVersion: string): Promise<void> => {
  await pendingMarkerRead;
  await AsyncStorage.setItem(RESTARTED_FROM_VERSION_KEY, currentVersion);
};

export const consumeUpdatedVersion = (currentVersion: string): Promise<string | null> => {
  const read = (async () => {
    const previousVersion = await AsyncStorage.getItem(RESTARTED_FROM_VERSION_KEY);
    if (previousVersion === null) return null;
    await AsyncStorage.removeItem(RESTARTED_FROM_VERSION_KEY);
    return isVersionLower(previousVersion, currentVersion) ? currentVersion : null;
  })();
  pendingMarkerRead = read.catch(() => {});
  return read;
};

const openPlayStoreListing = async (): Promise<void> => {
  try {
    await Linking.openURL(`market://details?id=${APP_PACKAGE_NAME}`);
  } catch {
    await Linking.openURL(`https://play.google.com/store/apps/details?id=${APP_PACKAGE_NAME}`);
  }
};

export const openStorePage = async (): Promise<void> => {
  if (Platform.OS !== 'ios') {
    await openPlayStoreListing();
    return;
  }
  try {
    await presentAppStorePage(APP_STORE_ID);
  } catch {
    await Linking.openURL(`itms-apps://apps.apple.com/app/id${APP_STORE_ID}`);
  }
};
