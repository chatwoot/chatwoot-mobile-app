// Background message handler - must be registered at app entry point
import { handleBackgroundMessage } from './NotificationService';

let messaging: any = null;
let isMessagingAvailable = false;

try {
  const messagingModule = require('@react-native-firebase/messaging');
  if (messagingModule && messagingModule.default) {
    messaging = messagingModule.default;
    isMessagingAvailable = true;
  }
} catch (e) {
  console.warn('@react-native-firebase/messaging not available for background handler');
}

// Register background message handler
export const registerBackgroundMessageHandler = () => {
  if (!isMessagingAvailable) {
    console.warn('Firebase messaging not available, skipping background handler registration');
    return;
  }

  try {
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      console.log('Background message handler called');
      await handleBackgroundMessage(remoteMessage);
    });
    console.log('Background message handler registered');
  } catch (error) {
    console.error('Error registering background message handler:', error);
  }
};

// Auto-register when this module is imported
if (isMessagingAvailable) {
  registerBackgroundMessageHandler();
}
