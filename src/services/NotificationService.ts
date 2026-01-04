import { Platform } from 'react-native';
import { transformNotification } from '@/utils/camelCaseKeys';
import { Notification } from '@/types/Notification';

// Lazy load modules to avoid crashes when not available
let notifee: any = null;
let messaging: any = null;
let isNotifeeAvailable = false;
let isMessagingAvailable = false;

// Initialize notifee
try {
  notifee = require('@notifee/react-native').default;
  isNotifeeAvailable = true;
} catch (e) {
  console.warn('@notifee/react-native not available');
}

// Initialize Firebase messaging
try {
  const messagingModule = require('@react-native-firebase/messaging');
  if (messagingModule && messagingModule.default) {
    messaging = messagingModule.default;
    isMessagingAvailable = true;
  }
} catch (e) {
  console.warn('@react-native-firebase/messaging not available');
}

// Channel IDs
export const CHANNEL_ID = {
  MESSAGES: 'aloochat_messages',
  DEFAULT: 'aloochat_default',
};

// Parse FCM message to get notification data
export const parseNotificationFromFCM = (remoteMessage: any): Notification | null => {
  try {
    let notification = null;
    
    // FCM HTTP v1 format
    if (remoteMessage?.data?.payload) {
      const parsedPayload = JSON.parse(remoteMessage.data.payload);
      notification = parsedPayload.data?.notification || parsedPayload.notification;
    }
    // FCM legacy format
    else if (remoteMessage?.data?.notification) {
      notification = JSON.parse(remoteMessage.data.notification);
    }
    
    if (notification) {
      return transformNotification(notification);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing FCM notification:', error);
    return null;
  }
};

// Create notification channels for Android
export const createNotificationChannels = async () => {
  if (!isNotifeeAvailable || Platform.OS !== 'android') {
    return;
  }

  try {
    // Messages channel - high importance for chat messages
    await notifee.createChannel({
      id: CHANNEL_ID.MESSAGES,
      name: 'Messages',
      description: 'New message notifications',
      importance: 4, // HIGH - AndroidImportance.HIGH
      vibration: true,
      vibrationPattern: [300, 500],
      sound: 'default',
      lights: true,
      lightColor: '#1F93FF',
      badge: true,
    });

    // Default channel
    await notifee.createChannel({
      id: CHANNEL_ID.DEFAULT,
      name: 'General',
      description: 'General notifications',
      importance: 3, // DEFAULT - AndroidImportance.DEFAULT
      sound: 'default',
    });

    console.log('Notification channels created successfully');
  } catch (error) {
    console.error('Error creating notification channels:', error);
  }
};

// Display a local notification
export const displayNotification = async ({
  title,
  body,
  data,
  channelId = CHANNEL_ID.MESSAGES,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
}) => {
  if (!isNotifeeAvailable) {
    console.warn('Notifee not available, cannot display notification');
    return;
  }

  try {
    const notificationConfig: any = {
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // Uses the app launcher icon
        pressAction: {
          id: 'default',
        },
        importance: 4, // HIGH
        sound: 'default',
        vibrationPattern: [300, 500],
        lights: ['#1F93FF', 300, 600],
        style: {
          type: 0, // BigTextStyle
          text: body,
        },
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
    };

    await notifee.displayNotification(notificationConfig);
    console.log('Notification displayed:', title);
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
};

// Handle foreground FCM messages
export const handleForegroundMessage = async (remoteMessage: any) => {
  console.log('Foreground message received:', JSON.stringify(remoteMessage, null, 2));
  
  const notification = parseNotificationFromFCM(remoteMessage);
  
  if (notification) {
    const { notificationType, primaryActor, pushMessageTitle } = notification;
    
    // Get title from notification
    let title = pushMessageTitle || 'New Message';
    let body = '';
    
    // Construct body based on notification type
    if (notificationType === 'conversation_creation') {
      body = 'New conversation started';
    } else if (notificationType === 'assigned_conversation_new_message') {
      body = 'You have a new message';
    } else if (notificationType === 'conversation_mention') {
      body = 'You were mentioned in a conversation';
    } else if (notificationType === 'participating_conversation_new_message') {
      body = 'New message in conversation';
    } else {
      body = 'You have a new notification';
    }
    
    // Try to get sender info from meta
    const senderName = (primaryActor?.meta?.sender as any)?.name;
    if (senderName) {
      title = senderName;
    }
    
    // Display the notification
    await displayNotification({
      title,
      body,
      data: {
        notification: JSON.stringify(notification),
        conversationId: String(primaryActor?.conversationId || primaryActor?.id || ''),
        notificationType,
      },
    });
  } else if (remoteMessage?.notification) {
    // Fallback: Use FCM notification payload directly
    await displayNotification({
      title: remoteMessage.notification.title || 'AlooChat',
      body: remoteMessage.notification.body || 'You have a new notification',
      data: remoteMessage.data,
    });
  }
};

// Handle background FCM messages
export const handleBackgroundMessage = async (remoteMessage: any) => {
  console.log('Background message received:', JSON.stringify(remoteMessage, null, 2));
  
  // For background messages, we need to display a notification manually
  // because FCM data-only messages don't show notifications automatically
  const notification = parseNotificationFromFCM(remoteMessage);
  
  if (notification) {
    const { notificationType, pushMessageTitle, primaryActor } = notification;
    
    let title = pushMessageTitle || 'New Message';
    let body = 'You have a new message';
    
    // Try to get sender info
    const senderName = (primaryActor?.meta?.sender as any)?.name;
    if (senderName) {
      title = senderName;
    }
    
    await displayNotification({
      title,
      body,
      data: {
        notification: JSON.stringify(notification),
        conversationId: String(primaryActor?.conversationId || primaryActor?.id || ''),
        notificationType,
      },
    });
  } else if (remoteMessage?.notification) {
    // Fallback for FCM notification payload
    await displayNotification({
      title: remoteMessage.notification.title || 'AlooChat',
      body: remoteMessage.notification.body || 'You have a new notification',
      data: remoteMessage.data,
    });
  }
};

// Set up foreground message listener
export const setupForegroundMessageListener = () => {
  if (!isMessagingAvailable) {
    console.warn('Firebase messaging not available');
    return () => {};
  }

  try {
    const unsubscribe = messaging().onMessage(handleForegroundMessage);
    console.log('Foreground message listener set up');
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return () => {};
  }
};

// Set up notification event handlers (for when user taps notification)
export const setupNotificationEventHandlers = (onNotificationPress: (data: any) => void) => {
  if (!isNotifeeAvailable) {
    return () => {};
  }

  try {
    // Handle notification press when app is in foreground/background
    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }: any) => {
      const EventType = require('@notifee/react-native').EventType;
      
      if (type === EventType.PRESS) {
        console.log('Notification pressed:', detail.notification);
        if (detail.notification?.data) {
          onNotificationPress(detail.notification.data);
        }
      }
    });

    return unsubscribeForeground;
  } catch (error) {
    console.error('Error setting up notification event handlers:', error);
    return () => {};
  }
};

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isMessagingAvailable) {
    console.warn('Firebase messaging not available');
    return false;
  }

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === 1 || // AUTHORIZED
      authStatus === 2;   // PROVISIONAL
    
    console.log('Notification permission status:', authStatus, 'enabled:', enabled);
    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  if (!isMessagingAvailable) {
    console.warn('Firebase messaging not available');
    return null;
  }

  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Initialize notification service
export const initializeNotificationService = async () => {
  console.log('Initializing notification service...');
  
  // Create notification channels for Android
  await createNotificationChannels();
  
  // Request permissions
  await requestNotificationPermission();
  
  console.log('Notification service initialized');
};

// Export availability flags
export { isNotifeeAvailable, isMessagingAvailable };
