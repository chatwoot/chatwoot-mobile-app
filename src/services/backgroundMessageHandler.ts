// Background message handler - MUST be registered at app entry point (App.tsx)
// This file is imported at the top of App.tsx BEFORE React renders
import { Platform } from 'react-native';

let messaging: any = null;
let notifee: any = null;
let isMessagingAvailable = false;
let isNotifeeAvailable = false;

// Initialize Firebase messaging
try {
  const messagingModule = require('@react-native-firebase/messaging');
  if (messagingModule && messagingModule.default) {
    messaging = messagingModule.default;
    isMessagingAvailable = true;
    console.log('[BackgroundHandler] Firebase messaging loaded successfully');
  }
} catch (e) {
  console.warn('[BackgroundHandler] @react-native-firebase/messaging not available:', e);
}

// Initialize notifee for displaying notifications
try {
  notifee = require('@notifee/react-native').default;
  isNotifeeAvailable = true;
  console.log('[BackgroundHandler] Notifee loaded successfully');
} catch (e) {
  console.warn('[BackgroundHandler] @notifee/react-native not available:', e);
}

// Channel ID for messages
const CHANNEL_ID = 'aloochat_messages';

// Create notification channel for Android (must be done before showing notifications)
const ensureChannelExists = async () => {
  if (!isNotifeeAvailable || Platform.OS !== 'android') {
    return;
  }
  
  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Messages',
      description: 'New message notifications',
      importance: 4, // HIGH
      vibration: true,
      sound: 'default',
    });
  } catch (error) {
    console.error('[BackgroundHandler] Error creating channel:', error);
  }
};

// Display notification using notifee
const displayBackgroundNotification = async (title: string, body: string, data: any) => {
  if (!isNotifeeAvailable) {
    console.warn('[BackgroundHandler] Cannot display notification - notifee not available');
    return;
  }

  try {
    // Ensure channel exists for Android
    await ensureChannelExists();

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
        importance: 4,
        sound: 'default',
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
    console.log('[BackgroundHandler] Notification displayed:', title);
  } catch (error) {
    console.error('[BackgroundHandler] Error displaying notification:', error);
  }
};

// Parse notification from FCM message
const parseNotificationFromMessage = (remoteMessage: any) => {
  try {
    // FCM HTTP v1 format
    if (remoteMessage?.data?.payload) {
      const parsedPayload = JSON.parse(remoteMessage.data.payload);
      return parsedPayload.data?.notification || parsedPayload.notification;
    }
    // FCM legacy format
    if (remoteMessage?.data?.notification) {
      return JSON.parse(remoteMessage.data.notification);
    }
    return null;
  } catch (error) {
    console.error('[BackgroundHandler] Error parsing notification:', error);
    return null;
  }
};

// Handle background message
const handleBackgroundMessage = async (remoteMessage: any) => {
  console.log('[BackgroundHandler] Background message received:', JSON.stringify(remoteMessage, null, 2));

  const notification = parseNotificationFromMessage(remoteMessage);

  if (notification) {
    // Extract notification details
    const { notification_type, push_message_title, primary_actor } = notification;
    
    let title = push_message_title || 'New Message';
    let body = 'You have a new message';

    // Try to get sender name
    const senderName = primary_actor?.meta?.sender?.name;
    if (senderName) {
      title = senderName;
    }

    // Customize body based on notification type
    if (notification_type === 'conversation_creation') {
      body = 'New conversation started';
    } else if (notification_type === 'assigned_conversation_new_message') {
      body = 'You have a new message';
    } else if (notification_type === 'conversation_mention') {
      body = 'You were mentioned in a conversation';
    } else if (notification_type === 'participating_conversation_new_message') {
      body = 'New message in conversation';
    }

    // Get conversation ID
    const conversationId = primary_actor?.conversation_id || primary_actor?.id || '';

    await displayBackgroundNotification(title, body, {
      notification: JSON.stringify(notification),
      conversationId: String(conversationId),
      notificationType: notification_type,
    });
  } else if (remoteMessage?.notification) {
    // Fallback: Use FCM notification payload directly
    await displayBackgroundNotification(
      remoteMessage.notification.title || 'AlooChat',
      remoteMessage.notification.body || 'You have a new notification',
      remoteMessage.data || {},
    );
  } else {
    console.log('[BackgroundHandler] No notification data found in message');
  }
};

// Register background message handler
export const registerBackgroundMessageHandler = () => {
  if (!isMessagingAvailable) {
    console.warn('[BackgroundHandler] Firebase messaging not available, skipping registration');
    return;
  }

  try {
    messaging().setBackgroundMessageHandler(handleBackgroundMessage);
    console.log('[BackgroundHandler] Background message handler registered successfully');
  } catch (error) {
    console.error('[BackgroundHandler] Error registering handler:', error);
  }
};

// Auto-register when this module is imported (at app startup)
if (isMessagingAvailable) {
  registerBackgroundMessageHandler();
  console.log('[BackgroundHandler] Module initialized');
}
