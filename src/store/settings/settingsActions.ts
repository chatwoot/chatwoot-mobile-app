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
import Constants from 'expo-constants';

// Firebase messaging - only load in production builds, not Expo Go
let firebaseMessaging: any = null;
const isExpoGo = Constants?.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    const messaging = require('@react-native-firebase/messaging');
    if (messaging && messaging.default) {
      firebaseMessaging = messaging.default;
      console.log('[settingsActions] ✅ Firebase messaging loaded');
    }
  } catch (e) {
    console.warn('[settingsActions] Firebase messaging not available');
  }
}

const getFirebaseMessaging = () => firebaseMessaging;

// Lazy load expo-notifications as fallback
let Notifications: any = null;
const getExpoNotifications = () => {
  if (Notifications) return Notifications;
  try {
    Notifications = require('expo-notifications');
    return Notifications;
  } catch (error) {
    console.warn('expo-notifications not available:', error);
    return null;
  }
};

// Mock device info for Expo Go
const mockDeviceInfo = {
  getSystemName: () => Platform.OS === 'ios' ? 'iOS' : 'Android',
  getManufacturer: () => Promise.resolve('Unknown'),
  getModel: () => Promise.resolve('Unknown'),
  getApiLevel: () => Promise.resolve(33),
  getBrand: () => Promise.resolve('Unknown'),
  getBuildNumber: () => Promise.resolve('1'),
  getUniqueId: () => Promise.resolve(`expo-go-${Date.now()}`),
};

let DeviceInfo: any = null;
let deviceInfoChecked = false;

const getDeviceInfo = () => {
  if (deviceInfoChecked) return DeviceInfo || mockDeviceInfo;
  
  deviceInfoChecked = true;
  try {
    const RNDeviceInfo = require('react-native-device-info');
    // Check if native module is actually available by testing a sync method
    if (RNDeviceInfo && typeof RNDeviceInfo.getSystemName === 'function') {
      try {
        // This will throw if native module is not linked
        RNDeviceInfo.getSystemName();
        DeviceInfo = RNDeviceInfo;
        return DeviceInfo;
      } catch (nativeError) {
        console.warn('react-native-device-info native module not available');
        return mockDeviceInfo;
      }
    }
    return mockDeviceInfo;
  } catch (error) {
    console.warn('react-native-device-info not available');
    return mockDeviceInfo;
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
        const expoNotifications = getExpoNotifications();
        
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

        let pushToken: string | null = null;
        let subscriptionType = Platform.OS === 'ios' ? 'apns' : 'fcm';

        // Try Firebase first
        if (messaging) {
          try {
            console.log('[saveDeviceDetails] Trying Firebase messaging...');
            const permissionEnabled = await messaging().hasPermission();

            if (!permissionEnabled || permissionEnabled === -1) {
              if (isAndroidAPILevelGreater32) {
                await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
              }
              await messaging().requestPermission();
            }

            // Register device for remote messages (required for iOS)
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
            
            pushToken = await messaging().getToken();
            if (pushToken) {
              // Firebase token is always FCM format (handles APNs conversion internally)
              subscriptionType = 'fcm';
              console.log('[saveDeviceDetails] ✅ Firebase FCM token obtained!');
            } else {
              console.warn('[saveDeviceDetails] Firebase getToken returned null');  
            }
          } catch (firebaseError) {
            console.warn('[saveDeviceDetails] Firebase error:', firebaseError);
          }
        }

        // Fallback to expo-notifications device token if Firebase failed
        if (!pushToken && expoNotifications) {
          try {
            console.log('[saveDeviceDetails] Trying expo-notifications fallback...');
            
            // Request permission through expo-notifications
            const { status: existingStatus } = await expoNotifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
              const { status } = await expoNotifications.requestPermissionsAsync();
              finalStatus = status;
            }
            
            if (finalStatus === 'granted') {
              // Try getDevicePushTokenAsync with retry for SERVICE_NOT_AVAILABLE
              const maxRetries = 3;
              for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                  console.log(`[saveDeviceDetails] Attempting getDevicePushTokenAsync (attempt ${attempt}/${maxRetries})...`);
                  const tokenData = await expoNotifications.getDevicePushTokenAsync();
                  pushToken = tokenData.data as string;
                  // getDevicePushTokenAsync returns APNs token on iOS, FCM token on Android
                  subscriptionType = Platform.OS === 'ios' ? 'apns' : 'fcm';
                  console.log(`[saveDeviceDetails] Expo device token obtained! Type: ${subscriptionType}`);
                  break;
                } catch (tokenError: any) {
                  console.warn(`[saveDeviceDetails] Attempt ${attempt} failed:`, tokenError?.message || tokenError);
                  if (attempt < maxRetries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                  }
                }
              }
              
              // If device token failed, try Expo Push Token as final fallback
              if (!pushToken) {
                try {
                  console.log('[saveDeviceDetails] Trying Expo Push Token as final fallback...');
                  const Constants = require('expo-constants').default;
                  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                  
                  if (projectId) {
                    const expoPushToken = await expoNotifications.getExpoPushTokenAsync({ projectId });
                    pushToken = expoPushToken.data;
                    subscriptionType = 'expo'; // Mark as Expo token
                    console.log('[saveDeviceDetails] Expo Push Token obtained:', pushToken);
                  } else {
                    console.warn('[saveDeviceDetails] No projectId for Expo Push Token');
                  }
                } catch (expoTokenError) {
                  console.warn('[saveDeviceDetails] Expo Push Token error:', expoTokenError);
                }
              }
            } else {
              console.warn('[saveDeviceDetails] Expo notification permission not granted');
            }
          } catch (expoError) {
            console.warn('[saveDeviceDetails] Expo notifications error:', expoError);
          }
        }

        console.log('[saveDeviceDetails] ====== PUSH TOKEN ======');
        console.log('[saveDeviceDetails] Token obtained:', pushToken ? 'YES' : 'NO');
        console.log('[saveDeviceDetails] Token value:', pushToken);
        console.log('[saveDeviceDetails] Subscription type:', subscriptionType);
        console.log('[saveDeviceDetails] ========================');

        if (!pushToken) {
          console.error('[saveDeviceDetails] ❌ NO PUSH TOKEN - notifications will NOT work!');
          return rejectWithValue('No push token obtained');
        }

        const pushData: PushPayload = {
          subscription_type: subscriptionType,
          subscription_attributes: {
            deviceName,
            devicePlatform,
            apiLevel: apiLevel.toString(),
            brandName,
            buildNumber,
            push_token: pushToken,
            device_id: deviceId,
          },
        };
        
        console.log('[saveDeviceDetails] Sending to backend:', JSON.stringify(pushData, null, 2));
        await SettingsService.saveDeviceDetails(pushData);
        console.log('[saveDeviceDetails] ✅ Push token registered with backend successfully!');
        return { fcmToken: pushToken };
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
