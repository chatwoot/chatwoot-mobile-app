import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Keyboard, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { useIsFocused } from '@react-navigation/native';
import { useStore } from 'react-redux';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

import i18n from '@/i18n';
import type { RootState } from '@/store';
import { selectMobileAppMinVersion } from '@/store/settings/settingsSelectors';
import { showToast } from '@/utils/toastUtils';
import {
  canInstallRelease,
  consumeUpdatedVersion,
  fetchAppStoreRelease,
  getStoreName,
  isolateBidi,
  isUpdatePromptSnoozed,
  isVersionLower,
  markRestartForUpdate,
  openStorePage,
  snoozeUpdatePrompt,
  waitForNotificationRequest,
  waitForServerPolicy,
  wasSignedInThisSession,
} from '@/utils/appUpdateUtils';
import {
  addInstallStatusListener,
  completePlayUpdate,
  getPlayUpdateInfo,
  startPlayUpdate,
  type InstallStatus,
} from '../../../modules/app-update';
import type { SheetRef } from '../common/sheet/Sheet';

import { DownloadingPill } from './DownloadingPill';
import { UpdateAvailableSheet } from './UpdateAvailableSheet';

type DownloadState = 'idle' | 'downloading' | 'downloaded';

const currentVersion = Application.nativeApplicationVersion ?? '';
const UPDATE_RECHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

const downloadStateFor = (status: InstallStatus): DownloadState | null => {
  switch (status) {
    case 'pending':
    case 'downloading':
      return 'downloading';
    case 'downloaded':
      return 'downloaded';
    case 'failed':
    case 'canceled':
    case 'installed':
      return 'idle';
    default:
      return null;
  }
};

/**
 * Optional store-update flow for the main tabs. Checks on launch and again on foreground at most
 * once a day: iOS shows the update sheet; Android starts Play's flexible update, shows a
 * downloading pill, and installs once the download finishes and the user is on the main tabs
 * (or left the app from them), falling back to the sheet when Play can't run the flow. Mount it
 * inside the main tabs screen so it only appears there.
 */
export const AppUpdatePrompt = () => {
  const isFocused = useIsFocused();
  const sheetRef = useRef<SheetRef>(null);
  const [sheetRequest, setSheetRequest] = useState<{ version: string | null } | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const downloadStateRef = useRef(downloadState);
  downloadStateRef.current = downloadState;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(Keyboard.isVisible());
  const isInstallingRef = useRef(false);
  const isCheckingRef = useRef(false);
  const isMountedRef = useRef(true);
  const store = useStore<RootState>();

  const isFocusedRef = useRef(isFocused);
  isFocusedRef.current = isFocused;
  const lastCheckedAtRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Versions below the server minimum belong to the required-update screen.
  const isBelowServerMinimum = useCallback(() => {
    const minVersion = selectMobileAppMinVersion(store.getState());
    return !!minVersion && isVersionLower(currentVersion, minVersion);
  }, [store]);

  // Re-read right before any sheet or Play UI, since checks await the store in between. The
  // launch check also skips the launch where the user signed in.
  const canPrompt = useCallback(
    (isLaunchCheck: boolean) =>
      isMountedRef.current &&
      isFocusedRef.current &&
      !Keyboard.isVisible() &&
      !(isLaunchCheck && wasSignedInThisSession()) &&
      !isBelowServerMinimum(),
    [isBelowServerMinimum],
  );

  const presentSheet = useCallback((version: string | null) => {
    setSheetRequest({ version });
  }, []);

  // Present after the sheet has rendered with the requested version.
  useEffect(() => {
    if (sheetRequest) sheetRef.current?.present();
  }, [sheetRequest]);

  const checkAndroid = useCallback(
    async (isLaunchCheck: boolean) => {
      const info = await getPlayUpdateInfo();
      if (!info) return;

      const existingState = downloadStateFor(info.installStatus);
      if (existingState && existingState !== 'idle') {
        setDownloadState(existingState);
        return;
      }
      if (info.updateAvailability !== 'available' || (await isUpdatePromptSnoozed())) return;
      if (!canPrompt(isLaunchCheck)) return;

      if (info.flexibleAllowed) {
        const result = await startPlayUpdate('flexible').catch(() => 'failed' as const);
        if (result === 'accepted') {
          setDownloadState('downloading');
          return;
        }
        if (result === 'declined') {
          await snoozeUpdatePrompt();
          return;
        }
      }
      // Play can't run the flexible flow here, so offer the store listing instead.
      if (canPrompt(isLaunchCheck)) presentSheet(null);
    },
    [canPrompt, presentSheet],
  );

  const checkIOS = useCallback(
    async (isLaunchCheck: boolean) => {
      const release = await fetchAppStoreRelease();
      if (!release || !isVersionLower(currentVersion, release.version)) return;
      if (!canInstallRelease(release, Device.osVersion ?? '0')) return;
      if (await isUpdatePromptSnoozed()) return;
      if (!canPrompt(isLaunchCheck)) return;
      presentSheet(release.version);
    },
    [canPrompt, presentSheet],
  );

  // One check at a time, claimed before any await so a foreground check can't run alongside the
  // launch check. It waits for this launch's server minimum and notification permission request,
  // so it neither shows under the required-update screen nor stacks on the permission dialog.
  const checkForUpdate = useCallback(
    async (isLaunchCheck: boolean) => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;
      lastCheckedAtRef.current = Date.now();
      try {
        await Promise.all([waitForServerPolicy(), waitForNotificationRequest()]);
        if (!isMountedRef.current || isBelowServerMinimum()) return;
        await (Platform.OS === 'android' ? checkAndroid(isLaunchCheck) : checkIOS(isLaunchCheck));
      } finally {
        isCheckingRef.current = false;
      }
    },
    [checkAndroid, checkIOS, isBelowServerMinimum],
  );

  // On launch: confirm a finished update, then look for a new one.
  useEffect(() => {
    const run = async () => {
      const updatedVersion = await consumeUpdatedVersion(currentVersion);
      if (updatedVersion) {
        showToast({
          message: i18n.t('APP_UPDATE.UPDATED', { version: isolateBidi(updatedVersion) }),
        });
      }
      await checkForUpdate(true);
    };
    run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Look again when the app returns to the foreground, at most once per interval, so a
  // session kept in memory for days still sees new releases once a snooze has ended.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      if (Date.now() - lastCheckedAtRef.current < UPDATE_RECHECK_INTERVAL_MS) return;
      checkForUpdate(false).catch(() => {});
    });
    return () => subscription.remove();
  }, [checkForUpdate]);

  // A restart is safe on the main tabs: in the foreground with the keyboard closed, or in the
  // background when the user left from them (Play then installs silently). Leaving from a
  // conversation would discard reply state that isn't persisted (recipients, editor mode).
  const canInstallSafely = useCallback(
    () => isFocusedRef.current && (AppState.currentState === 'background' || !Keyboard.isVisible()),
    [],
  );

  const installUpdate = useCallback(async () => {
    if (isInstallingRef.current || !canInstallSafely()) return;
    isInstallingRef.current = true;
    try {
      await markRestartForUpdate(currentVersion);
      // The user may have opened a conversation while the marker was being written.
      if (!canInstallSafely()) {
        isInstallingRef.current = false;
        return;
      }
      await completePlayUpdate();
    } catch {
      isInstallingRef.current = false;
    }
  }, [canInstallSafely]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const removeInstallListener = addInstallStatusListener(status => {
      const nextState = downloadStateFor(status);
      if (nextState) setDownloadState(nextState);
      if (nextState === 'downloaded') installUpdate();
    });
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'background') {
        if (downloadStateRef.current === 'downloaded') installUpdate();
        return;
      }
      if (state !== 'active') return;
      // A download can finish, or a background install can fail, while the app is away.
      getPlayUpdateInfo()
        .then(info => {
          const nextState = info && downloadStateFor(info.installStatus);
          if (nextState) setDownloadState(nextState);
          if (nextState === 'downloaded') installUpdate();
        })
        .catch(() => {});
    });
    return () => {
      removeInstallListener();
      appStateSubscription.remove();
    };
  }, [installUpdate]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Installs as soon as the user is back on the main tabs with the keyboard closed.
  const canInstallNow = downloadState === 'downloaded' && isFocused && !isKeyboardVisible;
  useEffect(() => {
    if (canInstallNow) installUpdate();
  }, [canInstallNow, installUpdate]);

  const handleUpdate = useCallback(() => {
    openStorePage().catch(() => {
      Snackbar.show({
        text: i18n.t('APP_UPDATE.OPTIONAL.STORE_ERROR', { store: getStoreName() }),
        duration: Snackbar.LENGTH_LONG,
      });
    });
  }, []);

  const handleSnooze = useCallback(() => {
    snoozeUpdatePrompt().catch(() => {});
  }, []);

  return (
    <>
      {downloadState === 'downloading' && isFocused && <DownloadingPill />}
      <UpdateAvailableSheet
        ref={sheetRef}
        version={sheetRequest?.version ?? null}
        onUpdate={handleUpdate}
        onSnooze={handleSnooze}
      />
    </>
  );
};
