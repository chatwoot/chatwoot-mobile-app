import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

import { useAppSelector } from '@/hooks';
import { selectMobileAppMinVersion } from '@/store/settings/settingsSelectors';
import {
  canInstallRelease,
  fetchAppStoreRelease,
  isVersionLower,
  APP_UPDATE_FAILURES,
  reportAppUpdateError,
} from '@/utils/appUpdateUtils';

const currentVersion = Application.nativeApplicationVersion ?? '';

type StoreAvailability = 'unknown' | 'available' | 'unavailable';

const checkAppStoreAvailability = async (minVersion: string): Promise<StoreAvailability> => {
  try {
    const release = await fetchAppStoreRelease();
    if (!release) return 'unknown';
    if (isVersionLower(release.version, minVersion)) return 'unavailable';
    return canInstallRelease(release, Device.osVersion ?? '0') ? 'available' : 'unavailable';
  } catch (error) {
    reportAppUpdateError(APP_UPDATE_FAILURES.APP_STORE_LOOKUP, error);
    return 'unknown';
  }
};

// iOS also needs an installable release.
export const useRequiredAppUpdate = () => {
  const minVersion = useAppSelector(selectMobileAppMinVersion);
  const [storeAvailability, setStoreAvailability] = useState<StoreAvailability>('unknown');

  const isBelowMinimum = !!minVersion && isVersionLower(currentVersion, minVersion);
  const needsStoreCheck = Platform.OS === 'ios' && isBelowMinimum;

  useEffect(() => {
    setStoreAvailability('unknown');
    if (!needsStoreCheck || !minVersion) return;
    let isCancelled = false;
    const check = () => {
      checkAppStoreAvailability(minVersion).then(availability => {
        if (isCancelled) return;
        setStoreAvailability(previous => (availability === 'unknown' ? previous : availability));
      });
    };
    check();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') check();
    });
    return () => {
      isCancelled = true;
      subscription.remove();
    };
  }, [needsStoreCheck, minVersion]);

  const isUpdateRequired =
    isBelowMinimum && (Platform.OS === 'android' || storeAvailability === 'available');

  return { isUpdateRequired, currentVersion, minVersion };
};
