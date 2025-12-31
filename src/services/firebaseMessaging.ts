/**
 * Firebase Cloud Messaging Service
 *
 * This file handles Firebase messaging initialization and background message handling.
 * It must be imported early in the app lifecycle, but AFTER Firebase has been initialized.
 */

import messaging from '@react-native-firebase/messaging';

const FIREBASE_ENABLED = process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true';

let isInitialized = false;

/**
 * Initialize Firebase Messaging
 * Should be called once when the app starts
 */
export const initializeFirebaseMessaging = async () => {
  if (!FIREBASE_ENABLED) {
    return;
  }

  if (isInitialized) {
    console.log('[Firebase] Messaging already initialized');
    return;
  }

  try {
    // Check if Firebase is available
    const fcmToken = await messaging().getToken();
    console.log('[Firebase] FCM Token:', fcmToken);

    // Set up background message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('[Firebase] Message handled in the background!', remoteMessage);
    });

    isInitialized = true;
    console.log('[Firebase] Messaging initialized successfully');
  } catch (error) {
    console.error('[Firebase] Failed to initialize messaging:', error);
  }
};

/**
 * Get initial notification when app is opened from a quit state
 */
export const getInitialNotification = async () => {
  if (!FIREBASE_ENABLED) {
    return null;
  }

  if (!isInitialized) {
    console.warn('[Firebase] Messaging not initialized yet');
    return null;
  }

  try {
    const message = await messaging().getInitialNotification();
    return message;
  } catch (error) {
    console.error('[Firebase] Failed to get initial notification:', error);
    return null;
  }
};

/**
 * Subscribe to notification opened events when app is in background
 */
export const onNotificationOpenedApp = (callback: (message: any) => void) => {
  if (!FIREBASE_ENABLED) {
    return () => {}; // Return empty unsubscribe function
  }

  if (!isInitialized) {
    console.warn('[Firebase] Messaging not initialized yet');
    return () => {}; // Return empty unsubscribe function
  }

  try {
    const unsubscribe = messaging().onNotificationOpenedApp(callback);
    return unsubscribe;
  } catch (error) {
    console.error('[Firebase] Failed to subscribe to notification opened:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Check if Firebase Messaging is initialized
 */
export const isMessagingInitialized = () => FIREBASE_ENABLED && isInitialized;

/**
 * Check if Firebase is enabled
 */
export const isFirebaseEnabled = () => FIREBASE_ENABLED;
