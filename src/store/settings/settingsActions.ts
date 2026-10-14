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
  extractUrlDetails,
  isLocalOrPrivateHost,
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
        const details = extractUrlDetails({ url });
        if (!details.isValid || details.hasWhitespace || !details.hostname) {
          throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
        }

        const { hostname, port, scheme } = details;
        const isLocal = isLocalOrPrivateHost(hostname);

        const formatCandidate = (protocol: 'http' | 'https') => {
          const portPart = port ? `:${port}` : '';
          return new URL(`${protocol}://${hostname}${portPart}/`);
        };

        let verifiedInstallationUrl = '';
        let verifiedWebSocketUrl = '';
        let baseUrl = '';

        if (scheme === 'http://') {
          const httpUrl = formatCandidate('http');
          if (!checkValidUrl({ url: httpUrl.href })) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
          const isValid = await SettingsService.verifyInstallationUrl(httpUrl.href);
          if (!isValid) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
          verifiedInstallationUrl = httpUrl.href;
          verifiedWebSocketUrl = buildWebSocketUrl(httpUrl.host, 'ws');
          baseUrl = httpUrl.host;
        } else if (scheme === 'https://') {
          const httpsUrl = formatCandidate('https');
          if (!checkValidUrl({ url: httpsUrl.href })) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
          const isValid = await SettingsService.verifyInstallationUrl(httpsUrl.href);
          if (!isValid) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
          verifiedInstallationUrl = httpsUrl.href;
          verifiedWebSocketUrl = buildWebSocketUrl(httpsUrl.host, 'wss');
          baseUrl = httpsUrl.host;
        } else {
          // No scheme provided. Probe HTTPS first.
          const httpsUrl = formatCandidate('https');
          if (!checkValidUrl({ url: httpsUrl.href })) {
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }

          const isHttpsValid = await SettingsService.verifyInstallationUrl(httpsUrl.href);
          if (isHttpsValid) {
            verifiedInstallationUrl = httpsUrl.href;
            verifiedWebSocketUrl = buildWebSocketUrl(httpsUrl.host, 'wss');
            baseUrl = httpsUrl.host;
          } else if (isLocal) {
            // Only allow cleartext HTTP fallback for local / private addresses (prevent captive portal / MITM downgrade).
            const httpUrl = formatCandidate('http');
            if (!checkValidUrl({ url: httpUrl.href })) {
              throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
            }
            const isHttpValid = await SettingsService.verifyInstallationUrl(httpUrl.href);
            if (isHttpValid) {
              verifiedInstallationUrl = httpUrl.href;
              verifiedWebSocketUrl = buildWebSocketUrl(httpUrl.host, 'ws');
              baseUrl = httpUrl.host;
            } else {
              throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
            }
          } else {
            // Bare public host failed HTTPS: do not silently downgrade to cleartext HTTP.
            throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
          }
        }

        return {
          installationUrl: verifiedInstallationUrl,
          webSocketUrl: verifiedWebSocketUrl,
          baseUrl,
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
