/**
 * Background message handler using expo-notifications
 * This file should be imported at the top of App.tsx
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Lazy load Firebase messaging
let messaging: any = null;

const getMessaging = () => {
  if (messaging) return messaging;
  try {
    messaging = require('@react-native-firebase/messaging').default;
    return messaging;
  } catch (error) {
    console.warn('[ExpoBackgroundHandler] Firebase messaging not available');
    return null;
  }
};

const CHANNEL_ID = 'aloochat_messages';

/**
 * Ensure notification channel exists on Android
 */
async function ensureChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'AlooChat Messages',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1F93FF',
      sound: 'default',
    });
  }
}

/**
 * Parse notification payload from FCM message
 */
function parsePayload(remoteMessage: any): { title: string; body: string; data: any } {
  const notification = remoteMessage?.notification || {};
  const data = remoteMessage?.data || {};

  // Try multiple payload formats
  let title = notification.title || data.title || data.notification_title || 'AlooChat';
  let body = notification.body || data.body || data.notification_body || data.message || 'New message';

  // Parse stringified JSON in data
  if (typeof data.notification === 'string') {
    try {
      const parsed = JSON.parse(data.notification);
      title = parsed.title || title;
      body = parsed.body || parsed.message || body;
    } catch (e) {}
  }

  return { title, body, data };
}

/**
 * Display notification using expo-notifications
 */
async function displayBackgroundNotification(
  title: string,
  body: string,
  data: any
): Promise<void> {
  try {
    await ensureChannel();

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null,
    });

    console.log('[ExpoBackgroundHandler] ✅ Notification displayed:', title);
  } catch (error) {
    console.error('[ExpoBackgroundHandler] ❌ Failed to display:', error);
  }
}

/**
 * Register background message handler with Firebase
 */
function registerBackgroundHandler(): void {
  const firebaseMessaging = getMessaging();
  
  if (!firebaseMessaging) {
    console.warn('[ExpoBackgroundHandler] Firebase not available, skipping registration');
    return;
  }

  firebaseMessaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log('[ExpoBackgroundHandler] Background message received:', JSON.stringify(remoteMessage));

    const { title, body, data } = parsePayload(remoteMessage);
    
    // Only display if there's no notification payload (data-only message)
    // Messages with notification payload are auto-displayed by the system
    if (!remoteMessage?.notification) {
      await displayBackgroundNotification(title, body, data);
    }
  });

  console.log('[ExpoBackgroundHandler] ✅ Background handler registered');
}

// Register immediately when this module is imported
registerBackgroundHandler();

export { displayBackgroundNotification, parsePayload };
