import { Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { getApps } from '@react-native-firebase/app';

/**
 * Notification utilities for development/testing
 */

export const sendTestForegroundNotification = async (): Promise<void> => {
  try {
    Alert.alert(
      'Test Notification',
      'This is a test notification to verify foreground display works correctly',
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'OK', style: 'default' },
      ],
    );
    // eslint-disable-next-line no-console
    console.log('Test foreground notification sent successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send test foreground notification:', error);
  }
};

export const checkNotificationPermissions = async (): Promise<number | null> => {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      // eslint-disable-next-line no-console
      console.log('Firebase not initialized - cannot check permissions');
      return null;
    }

    const authStatus = await messaging().hasPermission();

    const permissionStatus: Record<number, string> = {
      [messaging.AuthorizationStatus.NOT_DETERMINED]: 'Not Determined',
      [messaging.AuthorizationStatus.DENIED]: 'Denied',
      [messaging.AuthorizationStatus.AUTHORIZED]: 'Authorized',
      [messaging.AuthorizationStatus.PROVISIONAL]: 'Provisional',
    };

    const label = permissionStatus[Number(authStatus)] ?? 'Unknown';

    // eslint-disable-next-line no-console
    console.log('=== Notification Permission Status ===');
    // eslint-disable-next-line no-console
    console.log(`Platform: ${Platform.OS}`);
    // eslint-disable-next-line no-console
    console.log(`Permission: ${label}`);
    // eslint-disable-next-line no-console
    console.log(`Status Code: ${authStatus}`);

    return authStatus as unknown as number;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to check notification permissions:', error);
    return null;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      // eslint-disable-next-line no-console
      console.log('Firebase not initialized - cannot get FCM token');
      return null;
    }

    const token = await messaging().getToken();
    // eslint-disable-next-line no-console
    console.log('=== FCM Token ===');
    // eslint-disable-next-line no-console
    console.log(token);
    // eslint-disable-next-line no-console
    console.log('================');
    return token;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

export const logNotificationListeners = (): (() => void) => {
  // eslint-disable-next-line no-console
  console.log('=== Setting up notification listeners for testing ===');

  const apps = getApps();
  if (apps.length === 0) {
    // eslint-disable-next-line no-console
    console.log('Firebase not initialized - cannot setup notification listeners');
    return () => {};
  }

  try {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      // eslint-disable-next-line no-console
      console.log('Foreground notification received:', remoteMessage);
    });

    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      // eslint-disable-next-line no-console
      console.log('App opened from background notification:', remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // eslint-disable-next-line no-console
          console.log('App opened from cold start notification:', remoteMessage);
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log('Failed to get initial notification:', error);
      });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      // eslint-disable-next-line no-console
      console.log('Notification test listeners cleaned up');
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to setup notification listeners:', error);
    return () => {};
  }
};

export const runNotificationTest = async (): Promise<() => void> => {
  // eslint-disable-next-line no-console
  console.log('Starting comprehensive notification test...');

  const apps = getApps();
  if (apps.length === 0) {
    // eslint-disable-next-line no-console
    console.log('Firebase not initialized - cannot run notification tests');
    // eslint-disable-next-line no-console
    console.log('Make sure Firebase is properly configured and initialized');
    return () => {};
  }

  await checkNotificationPermissions();
  await getFCMToken();
  const cleanup = logNotificationListeners();
  await sendTestForegroundNotification();
  // eslint-disable-next-line no-console
  console.log('Notification test completed. Check logs above for results.');
  // eslint-disable-next-line no-console
  console.log('To test background notifications, use Firebase Console with the FCM token above.');

  return cleanup;
};


