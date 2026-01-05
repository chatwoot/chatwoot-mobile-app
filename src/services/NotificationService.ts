import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { transformNotification } from '@/utils/camelCaseKeys';
import { Notification } from '@/types/Notification';

// Lazy load modules to avoid crashes when not available
let notifee: any = null;
let messaging: any = null;
let EventType: any = null;
let AndroidImportance: any = null;
let isNotifeeAvailable = false;
let isMessagingAvailable = false;

// Initialize notifee
try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default;
  EventType = notifeeModule.EventType;
  AndroidImportance = notifeeModule.AndroidImportance;
  isNotifeeAvailable = true;
  console.log('[NotificationService] ✅ Notifee loaded');
} catch (e) {
  console.warn('[NotificationService] ❌ Notifee not available:', e);
}

// Initialize Firebase messaging
try {
  const messagingModule = require('@react-native-firebase/messaging');
  if (messagingModule && messagingModule.default) {
    messaging = messagingModule.default;
    isMessagingAvailable = true;
    console.log('[NotificationService] ✅ Firebase messaging loaded');
  }
} catch (e) {
  console.warn('[NotificationService] ❌ Firebase messaging not available:', e);
}

// Channel IDs - MUST match firebase.json messaging_android_notification_channel_id
export const CHANNEL_ID = {
  MESSAGES: 'aloochat_messages',
  DEFAULT: 'aloochat_default',
};

let channelsCreated = false;

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
  if (!isNotifeeAvailable || Platform.OS !== 'android' || channelsCreated) {
    return CHANNEL_ID.MESSAGES;
  }

  try {
    console.log('[NotificationService] Creating notification channels...');
    
    // Messages channel - high importance for chat messages
    const channelId = await notifee.createChannel({
      id: CHANNEL_ID.MESSAGES,
      name: 'Chat Messages',
      description: 'Notifications for new chat messages',
      importance: AndroidImportance?.HIGH || 4,
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
      importance: AndroidImportance?.DEFAULT || 3,
      sound: 'default',
    });

    channelsCreated = true;
    console.log('[NotificationService] ✅ Channels created:', channelId);
    return channelId;
  } catch (error) {
    console.error('[NotificationService] ❌ Channel creation error:', error);
    return CHANNEL_ID.MESSAGES;
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
  console.log('[NotificationService] 📢 displayNotification called:', { title, body });
  
  if (!isNotifeeAvailable) {
    console.error('[NotificationService] ❌ Cannot display - Notifee not available!');
    return null;
  }

  try {
    // CRITICAL: Ensure channel exists before displaying notification
    if (Platform.OS === 'android') {
      await createNotificationChannels();
    }

    const notificationConfig: any = {
      title: title || 'AlooChat',
      body: body || 'You have a new message',
      data: data || {},
      android: {
        channelId: CHANNEL_ID.MESSAGES,
        smallIcon: 'ic_launcher',
        color: '#1F93FF',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        importance: AndroidImportance?.HIGH || 4,
        sound: 'default',
        vibrationPattern: [300, 500],
        showTimestamp: true,
        autoCancel: true,
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

    const notificationId = await notifee.displayNotification(notificationConfig);
    console.log('[NotificationService] ✅ Notification displayed! ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('[NotificationService] ❌ Display error:', error);
    return null;
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
  console.log('[NotificationService] Setting up foreground message listener...');
  
  if (!isMessagingAvailable) {
    console.error('[NotificationService] ❌ Cannot setup listener - Firebase not available!');
    return () => {};
  }

  try {
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      console.log('[NotificationService] 🔔 ====== FCM MESSAGE RECEIVED ======');
      console.log('[NotificationService] 🔔 Raw message:', JSON.stringify(remoteMessage, null, 2));
      
      // Always try to show notification
      await handleForegroundMessage(remoteMessage);
    });
    
    console.log('[NotificationService] ✅ Foreground message listener ACTIVE');
    return unsubscribe;
  } catch (error) {
    console.error('[NotificationService] ❌ Listener setup error:', error);
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
  console.log('[NotificationService] ====== INITIALIZING ======');
  console.log('[NotificationService] Platform:', Platform.OS);
  console.log('[NotificationService] Notifee available:', isNotifeeAvailable);
  console.log('[NotificationService] Firebase available:', isMessagingAvailable);
  
  // Create notification channels for Android (MUST be done before showing notifications)
  await createNotificationChannels();
  
  // Request permissions
  const permissionGranted = await requestNotificationPermission();
  console.log('[NotificationService] Permission granted:', permissionGranted);
  
  if (!permissionGranted) {
    console.error('[NotificationService] ❌ PERMISSION DENIED - notifications will NOT work!');
  }
  
  // Set up notifee background handler
  setupNotifeeBackgroundHandler();
  
  console.log('[NotificationService] ✅ Notification service initialized');
  console.log('[NotificationService] ================================');
  
  return permissionGranted;
};

// TEST FUNCTION: Send a test notification to verify everything works
export const sendTestNotification = async () => {
  console.log('[NotificationService] 🧪 Sending TEST notification...');
  
  const result = await displayNotification({
    title: '🔔 AlooChat Test',
    body: 'If you see this, notifications are working!',
    data: { test: true, timestamp: Date.now() },
  });
  
  if (result) {
    console.log('[NotificationService] 🧪 ✅ Test notification sent successfully!');
  } else {
    console.log('[NotificationService] 🧪 ❌ Test notification FAILED!');
  }
  
  return result;
};

// DIAGNOSTIC FUNCTION: Check entire notification stack and return results
export const runNotificationDiagnostics = async (): Promise<{
  results: string[];
  fcmToken: string | null;
  allPassed: boolean;
}> => {
  const results: string[] = [];
  let fcmToken: string | null = null;
  let allPassed = true;

  // Check 1: Notifee availability
  if (isNotifeeAvailable) {
    results.push('✅ Notifee: Available');
  } else {
    results.push('❌ Notifee: NOT available');
    allPassed = false;
  }

  // Check 2: Firebase Messaging availability
  if (isMessagingAvailable) {
    results.push('✅ Firebase Messaging: Available');
  } else {
    results.push('❌ Firebase Messaging: NOT available');
    allPassed = false;
  }

  // Check 3: Notification permission
  try {
    if (isMessagingAvailable) {
      const authStatus = await messaging().hasPermission();
      if (authStatus === 1 || authStatus === 2) {
        results.push(`✅ Permission: Granted (status: ${authStatus})`);
      } else {
        results.push(`❌ Permission: DENIED (status: ${authStatus})`);
        allPassed = false;
      }
    }
  } catch (e) {
    results.push(`❌ Permission check failed: ${e}`);
    allPassed = false;
  }

  // Check 4: FCM Token
  try {
    if (isMessagingAvailable) {
      fcmToken = await messaging().getToken();
      if (fcmToken && fcmToken.length > 0) {
        results.push(`✅ FCM Token: ${fcmToken.substring(0, 20)}...`);
      } else {
        results.push('❌ FCM Token: EMPTY or NULL');
        allPassed = false;
      }
    }
  } catch (e) {
    results.push(`❌ FCM Token error: ${e}`);
    allPassed = false;
  }

  // Check 5: Android notification channel
  if (Platform.OS === 'android' && isNotifeeAvailable) {
    try {
      const channels = await notifee.getChannels();
      const hasChannel = channels.some((c: any) => c.id === CHANNEL_ID.MESSAGES);
      if (hasChannel) {
        results.push('✅ Android Channel: Created');
      } else {
        results.push('❌ Android Channel: NOT found - creating now...');
        await createNotificationChannels();
        results.push('   → Channel created');
      }
    } catch (e) {
      results.push(`❌ Channel check error: ${e}`);
    }
  }

  // Check 6: Test local notification
  try {
    const testResult = await displayNotification({
      title: '🔍 Diagnostic Test',
      body: 'This is a diagnostic notification',
      data: { diagnostic: true },
    });
    if (testResult) {
      results.push('✅ Local Notification: Displayed');
    } else {
      results.push('❌ Local Notification: FAILED to display');
      allPassed = false;
    }
  } catch (e) {
    results.push(`❌ Local Notification error: ${e}`);
    allPassed = false;
  }

  console.log('[Diagnostics] Results:', results);
  return { results, fcmToken, allPassed };
};

// Export availability flags
export { isNotifeeAvailable, isMessagingAvailable };
