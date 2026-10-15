import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Keyboard, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { RESULTS, checkNotifications } from 'react-native-permissions';
import { useIsFocused } from '@react-navigation/native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

import i18n from '@/i18n';
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

/** True while notification permission can still be requested, i.e. the system prompt may show this launch. */
const isNotificationPromptPending = async (): Promise<boolean> => {
  try {
    const { status } = await checkNotifications();
    return status === RESULTS.DENIED;
  } catch {
    return false;
  }
};

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
 * Optional store-update flow for the main tabs. Checks once per launch: iOS shows the update
 * sheet; Android starts Play's flexible update, shows a downloading pill, and installs once the
 * download finishes and the user is on the conversation list or has left the app, falling back
 * to the sheet when Play can't run the flow. Mount it inside the main tabs screen so it only
 * appears on the conversation list.
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

  const canPrompt = useCallback(
    async () =>
      isFocused &&
      !Keyboard.isVisible() &&
      !wasSignedInThisSession() &&
      !(await isNotificationPromptPending()),
    [isFocused],
  );
  const canPromptRef = useRef(canPrompt);
  canPromptRef.current = canPrompt;

  const presentSheet = useCallback((version: string | null) => {
    setSheetRequest({ version });
  }, []);

  // Present after the sheet has rendered with the requested version.
  useEffect(() => {
    if (sheetRequest) sheetRef.current?.present();
  }, [sheetRequest]);

  const checkAndroid = useCallback(async () => {
    const info = await getPlayUpdateInfo();
    if (!info) return;

    const existingState = downloadStateFor(info.installStatus);
    if (existingState && existingState !== 'idle') {
      setDownloadState(existingState);
      return;
    }
    if (info.updateAvailability !== 'available' || (await isUpdatePromptSnoozed())) return;
    if (!(await canPromptRef.current())) return;

    if (!info.flexibleAllowed) {
      presentSheet(null);
      return;
    }
    const result = await startPlayUpdate('flexible');
    if (result === 'accepted') {
      setDownloadState('downloading');
    } else if (result === 'declined') {
      await snoozeUpdatePrompt();
    }
  }, [presentSheet]);

  const checkIOS = useCallback(async () => {
    const release = await fetchAppStoreRelease();
    if (!release || !isVersionLower(currentVersion, release.version)) return;
    if (!canInstallRelease(release, Device.osVersion ?? '0')) return;
    if (await isUpdatePromptSnoozed()) return;
    if (!(await canPromptRef.current())) return;
    presentSheet(release.version);
  }, [presentSheet]);

  // Once per launch: confirm a finished update, then look for a new one.
  useEffect(() => {
    const run = async () => {
      const updatedVersion = await consumeUpdatedVersion(currentVersion);
      if (updatedVersion) {
        showToast({
          message: i18n.t('APP_UPDATE.UPDATED', { version: isolateBidi(updatedVersion) }),
        });
      }
      await (Platform.OS === 'android' ? checkAndroid() : checkIOS());
    };
    run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const installUpdate = useCallback(async () => {
    if (isInstallingRef.current) return;
    isInstallingRef.current = true;
    await markRestartForUpdate(currentVersion);
    await completePlayUpdate().catch(() => {
      isInstallingRef.current = false;
    });
  }, []);

  // Play installs silently when the app is in the background, so a downloaded update is
  // installed as soon as the user leaves the app.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const removeInstallListener = addInstallStatusListener(status => {
      const nextState = downloadStateFor(status);
      if (nextState) setDownloadState(nextState);
      if (nextState === 'downloaded' && AppState.currentState === 'background') installUpdate();
    });
    // A download can finish while the app is in the background.
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

  // In the foreground, install only on the conversation list with the keyboard closed, so the
  // restart never discards a reply in progress.
  const canInstallNow = downloadState === 'downloaded' && isFocused && !isKeyboardVisible;
  useEffect(() => {
    if (canInstallNow && AppState.currentState === 'active') installUpdate();
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
