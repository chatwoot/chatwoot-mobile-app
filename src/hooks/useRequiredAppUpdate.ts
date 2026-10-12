import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Application from 'expo-application';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { settingsActions } from '@/store/settings/settingsActions';
import {
  selectInstallationUrl,
  selectMobileAppMinVersion,
} from '@/store/settings/settingsSelectors';
import { fetchAppStoreRelease, isVersionLower } from '@/utils/appUpdateUtils';
import { getPlayUpdateInfo } from '../../modules/app-update';

const currentVersion = Application.nativeApplicationVersion ?? '';

type StoreAvailability = 'unknown' | 'available' | 'unavailable';

/**
 * Whether the store offers a version that satisfies `minVersion`. A failed check counts as
 * available, so the block still applies when the store can't be reached.
 */
const checkStoreAvailability = async (minVersion: string): Promise<StoreAvailability> => {
  try {
    if (Platform.OS === 'ios') {
      const release = await fetchAppStoreRelease();
      if (!release) return 'available';
      return isVersionLower(release.version, minVersion) ? 'unavailable' : 'available';
    }
    const info = await getPlayUpdateInfo();
    return info?.updateAvailability === 'not_available' ? 'unavailable' : 'available';
  } catch {
    return 'available';
  }
};

/**
 * Decides whether the app must be blocked until it is updated: the server's minimum app
 * version is above the installed one and the store already offers a version that meets it.
 * Re-checks the server and the store whenever the app returns to the foreground while the
 * installed version is below the minimum.
 */
export const useRequiredAppUpdate = () => {
  const dispatch = useAppDispatch();
  const installationUrl = useAppSelector(selectInstallationUrl);
  const minVersion = useAppSelector(selectMobileAppMinVersion);
  const [storeAvailability, setStoreAvailability] = useState<StoreAvailability>('unknown');

  const isBelowMinimum = !!minVersion && isVersionLower(currentVersion, minVersion);

  useEffect(() => {
    if (!isBelowMinimum || !minVersion) {
      setStoreAvailability('unknown');
      return;
    }
    let isCancelled = false;
    const check = () => {
      checkStoreAvailability(minVersion).then(availability => {
        if (!isCancelled) setStoreAvailability(availability);
      });
    };
    check();
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      dispatch(settingsActions.getChatwootVersion({ installationUrl }));
      check();
    });
    return () => {
      isCancelled = true;
      subscription.remove();
    };
  }, [dispatch, installationUrl, isBelowMinimum, minVersion]);

  return {
    isUpdateRequired: isBelowMinimum && storeAvailability !== 'unavailable',
    currentVersion,
    minVersion,
  };
};
