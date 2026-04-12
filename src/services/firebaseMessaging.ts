/**
 * Firebase Cloud Messaging Service
 *
 * This file handles Firebase messaging initialization and background message handling.
 * It must be imported early in the app lifecycle, but AFTER Firebase has been initialized.
 */

import messaging from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

const FIREBASE_ENABLED = process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true';

const noop = () => {};

if (FIREBASE_ENABLED) {
  messaging().setBackgroundMessageHandler(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('[Firebase] Message handled in the background!', remoteMessage);
    },
  );
}

/**
 * Initialize Firebase Messaging
 * Should be called once when the app starts
 */
export const initializeFirebaseMessaging = async () => {
  if (!FIREBASE_ENABLED) {
    return;
  }

  try {
    // Check if Firebase is available
    const fcmToken = await messaging().getToken();
    console.log('[Firebase] FCM Token:', fcmToken);
    console.log('[Firebase] Messaging initialized successfully');
  } catch (error) {
    console.error('[Firebase] Failed to initialize messaging:', error);
  }
};

/**
 * Get initial notification when app is opened from a quit state
 */
export const getInitialNotification =
  async (): Promise<FirebaseMessagingTypes.RemoteMessage | null> => {
    if (!FIREBASE_ENABLED) {
      return null;
    }

    try {
      return await messaging().getInitialNotification();
    } catch (error) {
      console.error('[Firebase] Failed to get initial notification:', error);
      return null;
    }
  };

/**
 * Subscribe to notification opened events when app is in background
 */
export const onNotificationOpenedApp = (
  callback: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): (() => void) => {
  if (!FIREBASE_ENABLED) {
    return noop;
  }

  try {
    return messaging().onNotificationOpenedApp(callback);
  } catch (error) {
    console.error('[Firebase] Failed to subscribe to notification opened:', error);
    return noop;
  }
};

/**
 * Check if Firebase is enabled
 */
export const isFirebaseEnabled = () => FIREBASE_ENABLED;
