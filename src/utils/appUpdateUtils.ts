import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

import i18n from '@/i18n';
import semver from 'semver';

import { presentAppStorePage } from '../../modules/app-update';

export const APP_UPDATE_FAILURES = {
  APP_STORE_LOOKUP: 'app_store_lookup',
  CHECK_FOR_UPDATE: 'check_for_update',
  COMPLETE_UPDATE: 'complete_update',
  CONSUME_UPDATED_VERSION: 'consume_updated_version',
  OPEN_REQUIRED_UPDATE: 'open_required_update',
  OPEN_STORE_PAGE: 'open_store_page',
  PRESENT_STORE_PAGE: 'present_store_page',
  READ_UPDATE_INFO: 'read_update_info',
  SNOOZE: 'snooze',
  START_FLEXIBLE_UPDATE: 'start_flexible_update',
  START_IMMEDIATE_UPDATE: 'start_immediate_update',
} as const;

type AppUpdateFailure = (typeof APP_UPDATE_FAILURES)[keyof typeof APP_UPDATE_FAILURES];

export const reportAppUpdateError = (failure: AppUpdateFailure, error: unknown): void => {
  Sentry.captureException(error, { tags: { 'app_update.failure': failure } });
};

export const APP_PACKAGE_NAME = 'com.chatwoot.app';
export const APP_STORE_ID = '1495796682';

const SNOOZE_DAYS = 3;

let hasSignedInThisSession = false;

// Prompts skip the sign-in launch.
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

// Keeps versions LTR in RTL text.
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
  const data: unknown = await response.json();
  const results =
    typeof data === 'object' && data !== null && 'results' in data ? data.results : null;
  const result: unknown = Array.isArray(results) ? results[0] : null;
  if (typeof result !== 'object' || result === null || !('version' in result)) return null;
  if (typeof result.version !== 'string' || !result.version) return null;
  const minimumOsVersion =
    'minimumOsVersion' in result && typeof result.minimumOsVersion === 'string'
      ? result.minimumOsVersion
      : '0';
  return { version: result.version, minimumOsVersion };
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

// Writes wait for this read.
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
  } catch (error) {
    reportAppUpdateError(APP_UPDATE_FAILURES.PRESENT_STORE_PAGE, error);
    await Linking.openURL(`itms-apps://apps.apple.com/app/id${APP_STORE_ID}`);
  }
};
