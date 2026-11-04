import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Keyboard, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { useIsFocused } from '@react-navigation/native';
import { useStore } from 'react-redux';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

import i18n from '@/i18n';
import { useAppSelector } from '@/hooks';
import type { RootState } from '@/store';
import { selectIsCallInProgress } from '@/store/call/callSelectors';
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
  onServerPolicyLoaded,
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
  const isCallInProgress = useAppSelector(selectIsCallInProgress);
  const lastCheckedAtRef = useRef(0);
  // A check that reached its prompt during a call, re-run when the call ends.
  const deferredCheckRef = useRef<{ isLaunchCheck: boolean } | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isBelowServerMinimum = useCallback(() => {
    const minVersion = selectMobileAppMinVersion(store.getState());
    return !!minVersion && isVersionLower(currentVersion, minVersion);
  }, [store]);

  // Re-checked right before showing any UI, since state can change while checks await.
  const canPrompt = useCallback(
    (isLaunchCheck: boolean) => {
      const canShow =
        isMountedRef.current &&
        isFocusedRef.current &&
        !Keyboard.isVisible() &&
        !(isLaunchCheck && wasSignedInThisSession()) &&
        !isBelowServerMinimum();
      if (!canShow) return false;
      // Update UI would cover the call controls.
      if (selectIsCallInProgress(store.getState())) {
        deferredCheckRef.current = { isLaunchCheck };
        return false;
      }
      return true;
    },
    [isBelowServerMinimum, store],
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

  // Waits for the minimum version and the notification prompt so it never shows under either.
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

  useEffect(() => {
    consumeUpdatedVersion(currentVersion)
      .then(updatedVersion => {
        if (!updatedVersion) return;
        showToast({
          message: i18n.t('APP_UPDATE.UPDATED', { version: isolateBidi(updatedVersion) }),
        });
      })
      .catch(() => {});
    checkForUpdate(true).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isCallInProgress || !deferredCheckRef.current) return;
    const { isLaunchCheck } = deferredCheckRef.current;
    deferredCheckRef.current = null;
    checkForUpdate(isLaunchCheck).catch(() => {});
  }, [isCallInProgress, checkForUpdate]);

  useEffect(
    () =>
      onServerPolicyLoaded(() => {
        if (Date.now() - lastCheckedAtRef.current < UPDATE_RECHECK_INTERVAL_MS) return;
        checkForUpdate(false).catch(() => {});
      }),
    [checkForUpdate],
  );

  // Restarting off the main tabs loses unsaved reply state. The call screen overlays the tabs
  // without blurring them, so calls are checked separately.
  const canInstallSafely = useCallback(
    () =>
      isMountedRef.current &&
      isFocusedRef.current &&
      !selectIsCallInProgress(store.getState()) &&
      (AppState.currentState === 'background' || !Keyboard.isVisible()),
    [store],
  );

  const installUpdate = useCallback(async () => {
    if (isInstallingRef.current || !canInstallSafely()) return;
    isInstallingRef.current = true;
    try {
      await markRestartForUpdate(currentVersion);
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

  const canInstallNow =
    downloadState === 'downloaded' && isFocused && !isKeyboardVisible && !isCallInProgress;
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
