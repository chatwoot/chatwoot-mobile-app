import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

import { useAppSelector } from '@/hooks';
import { selectMobileAppMinVersion } from '@/store/settings/settingsSelectors';
import { canInstallRelease, fetchAppStoreRelease, isVersionLower } from '@/utils/appUpdateUtils';

const currentVersion = Application.nativeApplicationVersion ?? '';

type StoreAvailability = 'unknown' | 'available' | 'unavailable';

const checkAppStoreAvailability = async (minVersion: string): Promise<StoreAvailability> => {
  try {
    const release = await fetchAppStoreRelease();
    if (!release) return 'unknown';
    if (isVersionLower(release.version, minVersion)) return 'unavailable';
    return canInstallRelease(release, Device.osVersion ?? '0') ? 'available' : 'unavailable';
  } catch {
    return 'unknown';
  }
};

// Android blocks on the version alone, since Play reports only version codes. iOS blocks only
// once the App Store confirms an installable release that meets the minimum.
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
