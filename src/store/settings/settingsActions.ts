import { createAsyncThunk } from '@reduxjs/toolkit';
// import * as Sentry from '@sentry/react-native';

let Sentry: any = {
  captureException: () => {},
};

try {
  Sentry = require('@sentry/react-native');
} catch (e) {
  console.warn('@sentry/react-native not available');
}

import { Platform, PermissionsAndroid } from 'react-native';

// Lazy load Firebase to avoid module initialization errors in Expo Go
let firebaseMessaging: any = null;
let isFirebaseAvailable = true;

const getFirebaseMessaging = () => {
  if (!isFirebaseAvailable) {
    return null;
  }
  
  if (firebaseMessaging === null) {
    try {
      firebaseMessaging = require('@react-native-firebase/messaging').default;
      // Check if the native module is actually available
      if (!firebaseMessaging) {
        isFirebaseAvailable = false;
        firebaseMessaging = null;
      }
    } catch (error) {
      console.warn('Firebase messaging module not available:', error);
      isFirebaseAvailable = false;
      firebaseMessaging = null;
    }
  }
  
  return firebaseMessaging;
};

let DeviceInfo: any = null;
const getDeviceInfo = () => {
  if (DeviceInfo) return DeviceInfo;
  try {
    DeviceInfo = require('react-native-device-info');
    return DeviceInfo;
  } catch (error) {
    console.warn('react-native-device-info not available:', error);
    return {
      getSystemName: () => 'Unknown',
      getManufacturer: () => Promise.resolve('Unknown'),
      getModel: () => Promise.resolve('Unknown'),
      getApiLevel: () => Promise.resolve('Unknown'),
      getBrand: () => Promise.resolve('Unknown'),
      getBuildNumber: () => Promise.resolve('Unknown'),
      getUniqueId: () => Promise.resolve('Unknown'),
    };
  }
};

import { SettingsService } from './settingsService';
import type {
  NotificationSettings,
  NotificationSettingsPayload,
  InstallationUrls,
  PushPayload,
} from './settingsTypes';
import I18n from '@/i18n';
import { URL_TYPE } from '@/constants/url';
import { checkValidUrl, extractDomain, handleApiError } from './settingsUtils';
import { showToast } from '@/utils/toastUtils';

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
        if (!checkValidUrl({ url })) {
          throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
        }

        const installationUrl = extractDomain({ url });
        const INSTALLATION_URL = `${URL_TYPE}${installationUrl}/`;
        const WEB_SOCKET_URL = `wss://${url}/cable`;
        const isValid = await SettingsService.verifyInstallationUrl(INSTALLATION_URL);

        if (!isValid) {
          throw new Error(I18n.t('CONFIGURE_URL.ERROR'));
        }

        return {
          installationUrl: INSTALLATION_URL,
          webSocketUrl: WEB_SOCKET_URL,
          baseUrl: installationUrl,
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

  getAlooChatVersion: createSettingsThunk<{ version: string }, { installationUrl: string }>(
    'settings/getAlooChatVersion',
    ({ installationUrl }) => SettingsService.getAlooChatVersion(installationUrl),
  ),

  saveDeviceDetails: createAsyncThunk<{ fcmToken: string }, void>(
    'settings/saveDeviceDetails',
    async (_, { rejectWithValue }) => {
      try {
        const messaging = getFirebaseMessaging();
        
        if (!messaging) {
          console.warn('Firebase messaging not available, skipping device details save');
          return rejectWithValue('Firebase messaging not available');
        }

        const permissionEnabled = await messaging().hasPermission();
        const {
          getUniqueId,
          getSystemName,
          getManufacturer,
          getModel,
          getApiLevel,
          getBrand,
          getBuildNumber,
        } = getDeviceInfo();

        const deviceId = await getUniqueId();
        const devicePlatform = getSystemName();
        const manufacturer = await getManufacturer();
        const model = await getModel();
        const apiLevel = await getApiLevel();
        const deviceName = `${manufacturer} ${model}`;

        const isAndroidAPILevelGreater32 = apiLevel > 32 && Platform.OS === 'android';
        const brandName = await getBrand();
        const buildNumber = await getBuildNumber();

        if (!permissionEnabled || permissionEnabled === -1) {
          if (isAndroidAPILevelGreater32) {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          }
          await messaging().requestPermission();
        }

        // Register device for remote messages (required for iOS)
        // https://github.com/invertase/react-native-firebase/issues/6893#issuecomment-1427998691
        if (Platform.OS === 'ios') {
          try {
            await messaging().registerDeviceForRemoteMessages();
            console.log('[saveDeviceDetails] Registered for remote messages on iOS');
          } catch (regError) {
            console.warn('[saveDeviceDetails] Failed to register for remote messages:', regError);
          }
        }

        // Small delay to ensure registration completes
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await sleep(500);
        
        const fcmToken = await messaging().getToken();
        console.log('[saveDeviceDetails] ====== FCM TOKEN ======');
        console.log('[saveDeviceDetails] Token obtained:', fcmToken ? 'YES' : 'NO');
        console.log('[saveDeviceDetails] Token value:', fcmToken);
        console.log('[saveDeviceDetails] ========================');

        if (!fcmToken) {
          console.error('[saveDeviceDetails] ❌ NO FCM TOKEN - notifications will NOT work!');
          return rejectWithValue('No FCM token obtained');
        }

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
        
        console.log('[saveDeviceDetails] Sending to backend:', JSON.stringify(pushData, null, 2));
        await SettingsService.saveDeviceDetails(pushData);
        console.log('[saveDeviceDetails] ✅ FCM token registered with backend successfully!');
        return { fcmToken };
      } catch (error) {
        Sentry.captureException(error);
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
