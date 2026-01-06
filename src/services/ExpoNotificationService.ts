/**
 * ExpoNotificationService - Using official expo-notifications library
 * Based on: https://docs.expo.dev/push-notifications/push-notifications-setup/
 * 
 * This is the recommended, proven approach for Expo projects.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure how notifications are handled when app is in foreground
// THIS IS CRITICAL - must be called at app startup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const CHANNEL_ID = {
  MESSAGES: 'aloochat_messages',
  SLA_ALERTS: 'aloochat_sla_alerts',
};

/**
 * Create Android notification channels - required for Android 8+
 */
export async function createNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    // Messages channel
    await Notifications.setNotificationChannelAsync(CHANNEL_ID.MESSAGES, {
      name: 'Chat Messages',
      description: 'New messages and conversation updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1F93FF',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });

    // SLA Alerts channel
    await Notifications.setNotificationChannelAsync(CHANNEL_ID.SLA_ALERTS, {
      name: 'SLA Alerts',
      description: 'Service Level Agreement alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#FF4444',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });

    console.log('[ExpoNotification] ✅ Android channels created');
  }
}

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('[ExpoNotification] Must use physical device for push notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[ExpoNotification] Permission not granted');
    return false;
  }

  console.log('[ExpoNotification] ✅ Permission granted');
  return true;
}

/**
 * Get Expo push token
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    if (!projectId) {
      console.error('[ExpoNotification] Project ID not found');
      return null;
    }

    const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[ExpoNotification] ✅ Expo push token:', pushTokenData.data);
    return pushTokenData.data;
  } catch (error) {
    console.error('[ExpoNotification] Error getting push token:', error);
    return null;
  }
}

/**
 * Get device push token (FCM token for Android, APNs token for iOS)
 */
export async function getDevicePushToken(): Promise<string | null> {
  try {
    const tokenData = await Notifications.getDevicePushTokenAsync();
    console.log('[ExpoNotification] ✅ Device push token:', tokenData.data);
    return tokenData.data as string;
  } catch (error) {
    console.error('[ExpoNotification] Error getting device token:', error);
    return null;
  }
}

/**
 * Display a local notification - THIS IS THE KEY FUNCTION
 */
export async function displayNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string | null> {
  try {
    // Ensure channel exists on Android
    await createNotificationChannel();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title || 'AlooChat',
        body: body || 'You have a new message',
        data: data || {},
        sound: 'default',
      },
      trigger: null, // null = show immediately
    });

    console.log('[ExpoNotification] ✅ Notification displayed! ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('[ExpoNotification] ❌ Failed to display notification:', error);
    return null;
  }
}

/**
 * Send a test notification to verify the system works
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.error('[ExpoNotification] No permission for test notification');
      return false;
    }

    const notificationId = await displayNotification(
      '🔔 Test Notification',
      'If you see this, notifications are working!',
      { test: true, timestamp: Date.now() }
    );

    return notificationId !== null;
  } catch (error) {
    console.error('[ExpoNotification] Test notification failed:', error);
    return false;
  }
}

/**
 * Initialize the notification service
 */
export async function initializeExpoNotifications(): Promise<void> {
  console.log('[ExpoNotification] Initializing...');
  
  // Create channel
  await createNotificationChannel();
  
  // Request permissions
  await requestPermissions();
  
  console.log('[ExpoNotification] ✅ Initialization complete');
}

/**
 * Add listener for notifications received while app is foregrounded
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when user taps on a notification
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Run diagnostics to verify notification system is working
 */
export async function runDiagnostics(): Promise<{
  success: boolean;
  checks: Record<string, boolean | string>;
}> {
  const checks: Record<string, boolean | string> = {};
  
  // Check if physical device
  checks['Physical Device'] = Device.isDevice;
  
  // Check permissions
  const { status } = await Notifications.getPermissionsAsync();
  checks['Permission Status'] = status;
  checks['Permission Granted'] = status === 'granted';
  
  // Check Expo push token
  try {
    const token = await getExpoPushToken();
    checks['Expo Push Token'] = token ? token.substring(0, 30) + '...' : 'FAILED';
  } catch (e) {
    checks['Expo Push Token'] = 'ERROR';
  }
  
  // Check Android channels
  if (Platform.OS === 'android') {
    const messagesChannel = await Notifications.getNotificationChannelAsync(CHANNEL_ID.MESSAGES);
    const slaChannel = await Notifications.getNotificationChannelAsync(CHANNEL_ID.SLA_ALERTS);
    checks['Messages Channel'] = messagesChannel ? 'Created' : 'Missing';
    checks['SLA Alerts Channel'] = slaChannel ? 'Created' : 'Missing';
  }
  
  // Test local notification
  try {
    const testId = await displayNotification(
      '✅ Diagnostic Test',
      'Notification system is working!',
      { diagnostic: true }
    );
    checks['Local Notification'] = testId ? 'SUCCESS' : 'FAILED';
  } catch (e) {
    checks['Local Notification'] = 'ERROR: ' + String(e);
  }
  
  const success = checks['Permission Granted'] === true && 
                  checks['Local Notification'] === 'SUCCESS';
  
  return { success, checks };
}
