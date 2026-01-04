// Background message handler - MUST be registered at app entry point (App.tsx)
// This file is imported at the top of App.tsx BEFORE React renders
import { Platform, AppRegistry } from 'react-native';

let messaging: any = null;
let notifee: any = null;
let AndroidImportance: any = null;
let isMessagingAvailable = false;
let isNotifeeAvailable = false;

// Initialize Firebase messaging
try {
  const messagingModule = require('@react-native-firebase/messaging');
  if (messagingModule && messagingModule.default) {
    messaging = messagingModule.default;
    isMessagingAvailable = true;
    console.log('[BGHandler] Firebase messaging loaded');
  }
} catch (e) {
  console.warn('[BGHandler] Firebase messaging not available:', e);
}

// Initialize notifee for displaying notifications
try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default;
  AndroidImportance = notifeeModule.AndroidImportance;
  isNotifeeAvailable = true;
  console.log('[BGHandler] Notifee loaded');
} catch (e) {
  console.warn('[BGHandler] Notifee not available:', e);
}

// Channel ID for messages - MUST match across all notification code
const CHANNEL_ID = 'aloochat_messages';
let channelCreated = false;

// Create notification channel for Android
const ensureChannelExists = async () => {
  if (!isNotifeeAvailable || Platform.OS !== 'android' || channelCreated) {
    return CHANNEL_ID;
  }
  
  try {
    const channelId = await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Chat Messages',
      description: 'Notifications for new chat messages',
      importance: AndroidImportance?.HIGH || 4,
      vibration: true,
      sound: 'default',
      badge: true,
    });
    channelCreated = true;
    console.log('[BGHandler] Channel created:', channelId);
    return channelId;
  } catch (error) {
    console.error('[BGHandler] Channel creation error:', error);
    return CHANNEL_ID;
  }
};

// Display notification - THE CORE FUNCTION
const showNotification = async (title: string, body: string, data?: any) => {
  console.log('[BGHandler] Attempting to show notification:', { title, body });
  
  if (!isNotifeeAvailable) {
    console.error('[BGHandler] CANNOT SHOW NOTIFICATION - Notifee not available!');
    return false;
  }

  try {
    const channelId = await ensureChannelExists();
    
    const notificationId = await notifee.displayNotification({
      title: title || 'AlooChat',
      body: body || 'You have a new message',
      data: data || {},
      android: {
        channelId: channelId,
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
    });
    
    console.log('[BGHandler] ✅ Notification displayed! ID:', notificationId);
    return true;
  } catch (error) {
    console.error('[BGHandler] ❌ Notification display FAILED:', error);
    return false;
  }
};

// Extract notification info from various payload formats
const extractNotificationInfo = (remoteMessage: any): { title: string; body: string; data: any } => {
  let title = 'AlooChat';
  let body = 'You have a new message';
  let data: any = {};

  try {
    console.log('[BGHandler] Parsing message:', JSON.stringify(remoteMessage, null, 2));

    // Method 1: FCM notification payload (shown automatically by system when app is killed)
    if (remoteMessage?.notification) {
      title = remoteMessage.notification.title || title;
      body = remoteMessage.notification.body || body;
      data = remoteMessage.data || {};
      console.log('[BGHandler] Found FCM notification payload');
    }

    // Method 2: Chatwoot HTTP v1 format - data.payload
    if (remoteMessage?.data?.payload) {
      try {
        const payload = JSON.parse(remoteMessage.data.payload);
        const notification = payload?.data?.notification || payload?.notification;
        
        if (notification) {
          title = notification.push_message_title || notification.title || title;
          body = notification.push_message_body || 'New message received';
          
          // Get sender name if available
          const senderName = notification.primary_actor?.meta?.sender?.name;
          if (senderName) {
            title = senderName;
          }
          
          // Get message content if available
          const messageContent = notification.primary_actor?.meta?.last_message?.content;
          if (messageContent) {
            body = messageContent;
          }
          
          data = {
            conversationId: String(notification.primary_actor?.conversation_id || notification.primary_actor?.id || ''),
            notificationType: notification.notification_type,
            rawNotification: JSON.stringify(notification),
          };
          console.log('[BGHandler] Parsed HTTP v1 payload');
        }
      } catch (parseError) {
        console.warn('[BGHandler] Failed to parse payload:', parseError);
      }
    }

    // Method 3: Chatwoot legacy format - data.notification
    if (remoteMessage?.data?.notification) {
      try {
        const notification = JSON.parse(remoteMessage.data.notification);
        title = notification.push_message_title || notification.title || title;
        body = notification.push_message_body || 'New message received';
        
        const senderName = notification.primary_actor?.meta?.sender?.name;
        if (senderName) {
          title = senderName;
        }
        
        data = {
          conversationId: String(notification.primary_actor?.conversation_id || notification.primary_actor?.id || ''),
          notificationType: notification.notification_type,
          rawNotification: remoteMessage.data.notification,
        };
        console.log('[BGHandler] Parsed legacy notification');
      } catch (parseError) {
        console.warn('[BGHandler] Failed to parse legacy notification:', parseError);
      }
    }

    // Method 4: Direct data fields (simple format)
    if (remoteMessage?.data) {
      if (remoteMessage.data.title && !remoteMessage.notification) {
        title = remoteMessage.data.title;
      }
      if (remoteMessage.data.body && !remoteMessage.notification) {
        body = remoteMessage.data.body;
      }
      if (remoteMessage.data.message) {
        body = remoteMessage.data.message;
      }
    }

  } catch (error) {
    console.error('[BGHandler] Error extracting notification info:', error);
  }

  return { title, body, data };
};

// Main background message handler
const handleBackgroundMessage = async (remoteMessage: any) => {
  console.log('[BGHandler] ====== BACKGROUND MESSAGE RECEIVED ======');
  console.log('[BGHandler] Time:', new Date().toISOString());
  console.log('[BGHandler] Message:', JSON.stringify(remoteMessage, null, 2));

  try {
    const { title, body, data } = extractNotificationInfo(remoteMessage);
    console.log('[BGHandler] Extracted - Title:', title, 'Body:', body);
    
    // ALWAYS try to show a notification
    await showNotification(title, body, data);
    
  } catch (error) {
    console.error('[BGHandler] Handler error:', error);
    // Even on error, try to show a basic notification
    await showNotification('AlooChat', 'You have a new notification', {});
  }
  
  console.log('[BGHandler] ====== HANDLER COMPLETE ======');
};

// Register the background message handler
const registerHandler = () => {
  if (!isMessagingAvailable) {
    console.warn('[BGHandler] Cannot register - Firebase not available');
    return;
  }

  try {
    // Set the background message handler for FCM
    messaging().setBackgroundMessageHandler(handleBackgroundMessage);
    console.log('[BGHandler] ✅ Background handler registered with Firebase');
    
    // Also register notifee background handler for notification actions
    if (isNotifeeAvailable) {
      notifee.onBackgroundEvent(async ({ type, detail }: any) => {
        console.log('[BGHandler] Notifee background event:', type, detail?.notification?.id);
      });
      console.log('[BGHandler] ✅ Notifee background handler registered');
    }
  } catch (error) {
    console.error('[BGHandler] Registration error:', error);
  }
};

// Register handler immediately when module loads
if (isMessagingAvailable) {
  registerHandler();
}

// Export for testing
export { showNotification, handleBackgroundMessage, registerHandler as registerBackgroundMessageHandler };
