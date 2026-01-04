import { Platform, PermissionsAndroid } from 'react-native';
import { transformNotification } from '@/utils/camelCaseKeys';
import { Notification } from '@/types/Notification';

// Lazy load modules to avoid crashes when not available
let notifee: any = null;
let messaging: any = null;
let EventType: any = null;
let isNotifeeAvailable = false;
let isMessagingAvailable = false;

// Initialize notifee
try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default;
  EventType = notifeeModule.EventType;
  isNotifeeAvailable = true;
  console.log('[NotificationService] Notifee loaded successfully');
} catch (e) {
  console.warn('[NotificationService] @notifee/react-native not available:', e);
}

// Initialize Firebase messaging
try {
  const messagingModule = require('@react-native-firebase/messaging');
  if (messagingModule && messagingModule.default) {
    messaging = messagingModule.default;
    isMessagingAvailable = true;
    console.log('[NotificationService] Firebase messaging loaded successfully');
  }
} catch (e) {
  console.warn('[NotificationService] @react-native-firebase/messaging not available:', e);
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

// Extract notification info from FCM message (handles multiple payload formats)
const extractNotificationInfo = (remoteMessage: any): { title: string; body: string; data: any } => {
  let title = 'AlooChat';
  let body = 'You have a new message';
  let data: any = {};

  try {
    // Method 1: FCM notification payload
    if (remoteMessage?.notification) {
      title = remoteMessage.notification.title || title;
      body = remoteMessage.notification.body || body;
      data = remoteMessage.data || {};
    }

    // Method 2: Chatwoot HTTP v1 format - data.payload
    if (remoteMessage?.data?.payload) {
      try {
        const payload = JSON.parse(remoteMessage.data.payload);
        const notification = payload?.data?.notification || payload?.notification;
        
        if (notification) {
          title = notification.push_message_title || notification.title || title;
          body = notification.push_message_body || 'New message received';
          
          const senderName = notification.primary_actor?.meta?.sender?.name;
          if (senderName) title = senderName;
          
          const messageContent = notification.primary_actor?.meta?.last_message?.content;
          if (messageContent) body = messageContent;
          
          data = {
            conversationId: String(notification.primary_actor?.conversation_id || notification.primary_actor?.id || ''),
            notificationType: notification.notification_type,
          };
        }
      } catch (e) {
        console.warn('[NotificationService] Failed to parse payload:', e);
      }
    }

    // Method 3: Chatwoot legacy format - data.notification
    if (remoteMessage?.data?.notification) {
      try {
        const notification = JSON.parse(remoteMessage.data.notification);
        title = notification.push_message_title || notification.title || title;
        body = notification.push_message_body || 'New message received';
        
        const senderName = notification.primary_actor?.meta?.sender?.name;
        if (senderName) title = senderName;
        
        data = {
          conversationId: String(notification.primary_actor?.conversation_id || notification.primary_actor?.id || ''),
          notificationType: notification.notification_type,
        };
      } catch (e) {
        console.warn('[NotificationService] Failed to parse legacy notification:', e);
      }
    }

    // Method 4: Direct data fields
    if (remoteMessage?.data) {
      if (remoteMessage.data.title && !remoteMessage.notification) title = remoteMessage.data.title;
      if (remoteMessage.data.body && !remoteMessage.notification) body = remoteMessage.data.body;
      if (remoteMessage.data.message) body = remoteMessage.data.message;
    }
  } catch (error) {
    console.error('[NotificationService] Error extracting notification info:', error);
  }

  return { title, body, data };
};

// Handle foreground FCM messages
export const handleForegroundMessage = async (remoteMessage: any) => {
  console.log('[NotificationService] ====== FOREGROUND MESSAGE ======');
  console.log('[NotificationService] Message:', JSON.stringify(remoteMessage, null, 2));
  
  try {
    const { title, body, data } = extractNotificationInfo(remoteMessage);
    console.log('[NotificationService] Extracted - Title:', title, 'Body:', body);
    
    // ALWAYS display notification for foreground messages
    await displayNotification({ title, body, data });
    
  } catch (error) {
    console.error('[NotificationService] Foreground handler error:', error);
    // Fallback - still try to show something
    if (remoteMessage?.notification) {
      await displayNotification({
        title: remoteMessage.notification.title || 'AlooChat',
        body: remoteMessage.notification.body || 'You have a new notification',
        data: remoteMessage.data,
      });
    }
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
      console.log('[NotificationService] Foreground event type:', type);
      
      if (type === EventType?.PRESS) {
        console.log('[NotificationService] Notification pressed:', detail.notification);
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

// Request notification permissions for both Android and iOS
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    // Request Android 13+ POST_NOTIFICATIONS permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('[NotificationService] Android POST_NOTIFICATIONS permission:', granted);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('[NotificationService] Android notification permission denied');
        return false;
      }
    }

    // Request Firebase messaging permission (required for iOS)
    if (isMessagingAvailable) {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === 1 || // AUTHORIZED
        authStatus === 2;   // PROVISIONAL
      
      console.log('[NotificationService] Firebase permission status:', authStatus, 'enabled:', enabled);
      return enabled;
    }

    // If no Firebase but notifee is available, request notifee permissions
    if (isNotifeeAvailable) {
      const settings = await notifee.requestPermission();
      console.log('[NotificationService] Notifee permission settings:', settings);
      return settings.authorizationStatus >= 1; // AUTHORIZED or PROVISIONAL
    }

    return false;
  } catch (error) {
    console.error('[NotificationService] Error requesting notification permission:', error);
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

// Set up notifee background event handler (for notification actions when app is killed)
export const setupNotifeeBackgroundHandler = () => {
  if (!isNotifeeAvailable) {
    return;
  }

  try {
    notifee.onBackgroundEvent(async ({ type, detail }: any) => {
      console.log('[NotificationService] Background event:', type, detail);
      
      if (type === EventType?.PRESS) {
        // Handle notification press when app is killed
        console.log('[NotificationService] Background notification pressed:', detail.notification);
      }
    });
    console.log('[NotificationService] Notifee background handler set up');
  } catch (error) {
    console.error('[NotificationService] Error setting up notifee background handler:', error);
  }
};

// Initialize notification service
export const initializeNotificationService = async () => {
  console.log('[NotificationService] Initializing notification service...');
  
  // Create notification channels for Android (MUST be done before showing notifications)
  await createNotificationChannels();
  
  // Request permissions
  const permissionGranted = await requestNotificationPermission();
  console.log('[NotificationService] Permission granted:', permissionGranted);
  
  // Set up notifee background handler
  setupNotifeeBackgroundHandler();
  
  console.log('[NotificationService] Notification service initialized successfully');
  
  return permissionGranted;
};

// Export availability flags
export { isNotifeeAvailable, isMessagingAvailable };
