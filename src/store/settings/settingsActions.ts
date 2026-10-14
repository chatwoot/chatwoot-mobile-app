import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react-native';

import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { RESULTS, checkNotifications, requestNotifications } from 'react-native-permissions';
import {
  getSystemName,
  getManufacturer,
  getModel,
  getApiLevel,
  getBrand,
  getBuildNumber,
  getUniqueId,
} from 'react-native-device-info';

import { SettingsService } from './settingsService';
import type {
  NotificationSettings,
  NotificationSettingsPayload,
  InstallationUrls,
  PushPayload,
} from './settingsTypes';
import I18n from '@/i18n';
import {
  checkValidUrl,
  extractDomain,
  extractScheme,
  handleApiError,
  buildWebSocketUrl,
} from './settingsUtils';
import { showToast } from '@/utils/toastUtils';
import { isUnactionablePushError } from '@/utils/sentryUtils';

const createSettingsThunk = <TResponse, TPayload>(
  type: string,
  handler: (payload: TPayload) => Promise<TResponse>,
  errorMessage?: string,
) => {
  return createAsyncThunk<TResponse, TPayload>(type, async (payload, { rejectWithValue }) => {
    try {
      return await handler(payload);
    } catch (error) {
      return rejectWithValue(handleApiError(error, errorMessage));
    }
  });
};

export const settingsActions = {
  setInstallationUrl: createAsyncThunk<InstallationUrls, string>(
    'settings/setInstallationUrl',
    async (url, { rejectWithValue }) => {
      try {
        const host = extractDomain({ url });
        const scheme = extractScheme({ url });

        if (!host || /\s/.test(host)) {
          throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
        }

        let verifiedInstallationUrl = '';
        let verifiedWebSocketUrl = '';

        if (scheme === 'http://') {
          const testUrl = `http://${host}/`;
          if (!checkValidUrl({ url: testUrl })) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
          const isValid = await SettingsService.verifyInstallationUrl(testUrl);
          if (!isValid) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
          verifiedInstallationUrl = testUrl;
          verifiedWebSocketUrl = buildWebSocketUrl(host, 'ws');
        } else if (scheme === 'https://') {
          const testUrl = `https://${host}/`;
          if (!checkValidUrl({ url: testUrl })) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
          const isValid = await SettingsService.verifyInstallationUrl(testUrl);
          if (!isValid) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
          verifiedInstallationUrl = testUrl;
          verifiedWebSocketUrl = buildWebSocketUrl(host, 'wss');
        } else {
          // No scheme provided. Try https first; fallback to http if https fails.
          const httpsUrl = `https://${host}/`;
          const httpUrl = `http://${host}/`;

          if (!checkValidUrl({ url: httpsUrl })) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }

          const isHttpsValid = await SettingsService.verifyInstallationUrl(httpsUrl);
          if (isHttpsValid) {
            verifiedInstallationUrl = httpsUrl;
            verifiedWebSocketUrl = buildWebSocketUrl(host, 'wss');
          } else {
            const isHttpValid = await SettingsService.verifyInstallationUrl(httpUrl);
            if (isHttpValid) {
              verifiedInstallationUrl = httpUrl;
              verifiedWebSocketUrl = buildWebSocketUrl(host, 'ws');
            } else {
              throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
            }
          }
        }

        return {
          installationUrl: verifiedInstallationUrl,
          webSocketUrl: verifiedWebSocketUrl,
          baseUrl: host,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : I18n.t('CONFIGURE_URL.ERROR');
        showToast({ message });
        return rejectWithValue(message);
      }
    },
  ),

  getNotificationSettings: createSettingsThunk<NotificationSettings, void>(
    'settings/getNotificationSettings',
    () => SettingsService.getNotificationSettings(),
  ),

  updateNotificationSettings: createSettingsThunk<
    NotificationSettings,
    NotificationSettingsPayload
  >('settings/updateNotificationSettings', SettingsService.updateNotificationSettings),

  getChatwootVersion: createSettingsThunk<{ version: string }, { installationUrl: string }>(
    'settings/getChatwootVersion',
    ({ installationUrl }) => SettingsService.getChatwootVersion(installationUrl),
  ),

  saveDeviceDetails: createAsyncThunk<{ fcmToken: string }, void>(
    'settings/saveDeviceDetails',
    async (_, { rejectWithValue }) => {
      try {
        const deviceId = await getUniqueId();
        const devicePlatform = getSystemName();
        const manufacturer = await getManufacturer();
        const model = await getModel();
        const apiLevel = await getApiLevel();
        const deviceName = `${manufacturer} ${model}`;

        const brandName = await getBrand();
        const buildNumber = await getBuildNumber();

        // Covers the iOS prompt and Android 13+ POST_NOTIFICATIONS in one call.
        const { status } = await checkNotifications();
        if (status !== RESULTS.GRANTED) {
          await requestNotifications(['alert', 'sound', 'badge']);
        }

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        // https://github.com/invertase/react-native-firebase/issues/6893#issuecomment-1427998691
        // await messaging().registerDeviceForRemoteMessages();
        await sleep(1000);
        const fcmToken = await getToken(getMessaging());

        const pushData: PushPayload = {
          subscription_type: 'fcm',
          subscription_attributes: {
            deviceName,
            devicePlatform,
            apiLevel: apiLevel.toString(),
            brandName,
            buildNumber,
            push_token: fcmToken,
            device_id: deviceId,
          },
        };
        await SettingsService.saveDeviceDetails(pushData);
        return { fcmToken };
      } catch (error) {
        if (!isUnactionablePushError(error)) {
          Sentry.captureException(error);
        }
        return rejectWithValue(
          error instanceof Error ? error.message : 'Error saving device details',
        );
      }
    },
  ),

  removeDevice: createSettingsThunk<void, { pushToken: string }>(
    'settings/removeDevice',
    ({ pushToken }) => SettingsService.removeDevice({ push_token: pushToken }),
  ),
};
