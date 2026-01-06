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

const CHANNEL_ID = {
  MESSAGES: 'aloochat_messages',
  SLA_ALERTS: 'aloochat_sla_alerts',
};

// Notification types from Chatwoot
const NOTIFICATION_TYPES = {
  CONVERSATION_CREATION: 'conversation_creation',
  CONVERSATION_ASSIGNMENT: 'conversation_assignment',
  ASSIGNED_CONVERSATION_NEW_MESSAGE: 'assigned_conversation_new_message',
  PARTICIPATING_CONVERSATION_NEW_MESSAGE: 'participating_conversation_new_message',
  CONVERSATION_MENTION: 'conversation_mention',
  SLA_MISSED_FIRST_RESPONSE: 'sla_missed_first_response',
  SLA_MISSED_NEXT_RESPONSE: 'sla_missed_next_response',
  SLA_MISSED_RESOLUTION: 'sla_missed_resolution',
};

/**
 * Ensure notification channels exist on Android
 */
async function ensureChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    // Messages channel
    await Notifications.setNotificationChannelAsync(CHANNEL_ID.MESSAGES, {
      name: 'Chat Messages',
      description: 'New messages and conversation updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1F93FF',
      sound: 'default',
    });

    // SLA Alerts channel
    await Notifications.setNotificationChannelAsync(CHANNEL_ID.SLA_ALERTS, {
      name: 'SLA Alerts',
      description: 'Service Level Agreement alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#FF4444',
      sound: 'default',
    });
  }
}

/**
 * Get notification content based on notification type
 */
function getNotificationContent(notificationType: string, notificationData: any): {
  title: string;
  body: string;
  channelId: string;
} {
  // Extract data from various locations in the payload
  const senderName = notificationData?.primary_actor?.meta?.sender?.name || 
                     notificationData?.meta?.sender?.name || '';
  const messageContent = notificationData?.primary_actor?.meta?.last_message?.content || 
                         notificationData?.meta?.last_message?.content || '';
  const conversationId = notificationData?.primary_actor?.conversation_id || 
                         notificationData?.primary_actor?.id ||
                         notificationData?.conversation_id || '';
  const pushTitle = notificationData?.push_message_title || '';
  const pushBody = notificationData?.push_message_body || '';
  
  console.log('[ExpoBackgroundHandler] Extracting content:', {
    notificationType,
    senderName,
    messageContent: messageContent?.substring(0, 50),
    conversationId,
    pushTitle,
    pushBody: pushBody?.substring(0, 50),
  });

  switch (notificationType) {
    case NOTIFICATION_TYPES.ASSIGNED_CONVERSATION_NEW_MESSAGE:
      return {
        title: senderName || pushTitle || 'New Message',
        body: messageContent || pushBody || 'You have a new message in your assigned conversation',
        channelId: CHANNEL_ID.MESSAGES,
      };

    case NOTIFICATION_TYPES.CONVERSATION_ASSIGNMENT:
      return {
        title: '📋 Conversation Assigned',
        body: `A conversation has been assigned to you${conversationId ? ` (#${conversationId})` : ''}`,
        channelId: CHANNEL_ID.MESSAGES,
      };

    case NOTIFICATION_TYPES.PARTICIPATING_CONVERSATION_NEW_MESSAGE:
      return {
        title: senderName || pushTitle || 'New Message',
        body: messageContent || pushBody || 'New message in a conversation you\'re participating in',
        channelId: CHANNEL_ID.MESSAGES,
      };

    case NOTIFICATION_TYPES.CONVERSATION_CREATION:
      return {
        title: '💬 New Conversation',
        body: pushBody || pushTitle || 'A new conversation has been created',
        channelId: CHANNEL_ID.MESSAGES,
      };

    case NOTIFICATION_TYPES.CONVERSATION_MENTION:
      return {
        title: '🔔 You were mentioned',
        body: messageContent || pushBody || `${senderName || 'Someone'} mentioned you in a conversation`,
        channelId: CHANNEL_ID.MESSAGES,
      };

    case NOTIFICATION_TYPES.SLA_MISSED_FIRST_RESPONSE:
      return {
        title: '⚠️ SLA Alert: First Response Missed',
        body: `Conversation #${conversationId} has missed the first response SLA`,
        channelId: CHANNEL_ID.SLA_ALERTS,
      };

    case NOTIFICATION_TYPES.SLA_MISSED_NEXT_RESPONSE:
      return {
        title: '⚠️ SLA Alert: Response Overdue',
        body: `Conversation #${conversationId} has missed the next response SLA`,
        channelId: CHANNEL_ID.SLA_ALERTS,
      };

    case NOTIFICATION_TYPES.SLA_MISSED_RESOLUTION:
      return {
        title: '🚨 SLA Alert: Resolution Overdue',
        body: `Conversation #${conversationId} has missed the resolution SLA`,
        channelId: CHANNEL_ID.SLA_ALERTS,
      };

    default:
      return {
        title: pushTitle || senderName || 'AlooChat',
        body: messageContent || pushBody || 'You have a new notification',
        channelId: CHANNEL_ID.MESSAGES,
      };
  }
}

/**
 * Parse notification payload from FCM message
 */
function parsePayload(remoteMessage: any): { 
  title: string; 
  body: string; 
  data: any;
  channelId: string;
  notificationType: string;
} {
  console.log('[ExpoBackgroundHandler] ====== PARSING FCM MESSAGE ======');
  console.log('[ExpoBackgroundHandler] Raw message:', JSON.stringify(remoteMessage, null, 2));
  
  const fcmNotification = remoteMessage?.notification || {};
  const data = remoteMessage?.data || {};

  let notificationType = '';
  let notificationData: any = null;
  let channelId = CHANNEL_ID.MESSAGES;

  // Method 1: Chatwoot HTTP v1 format - data.payload
  if (data.payload) {
    console.log('[ExpoBackgroundHandler] Found data.payload, parsing...');
    try {
      const payload = JSON.parse(data.payload);
      console.log('[ExpoBackgroundHandler] Parsed payload:', JSON.stringify(payload, null, 2));
      notificationData = payload?.data?.notification || payload?.notification;
      notificationType = notificationData?.notification_type || '';
      console.log('[ExpoBackgroundHandler] Method 1 - notification_type:', notificationType);
    } catch (e) {
      console.warn('[ExpoBackgroundHandler] Failed to parse payload:', e);
    }
  }

  // Method 2: Chatwoot legacy format - data.notification
  if (!notificationData && data.notification) {
    console.log('[ExpoBackgroundHandler] Found data.notification, parsing...');
    try {
      notificationData = JSON.parse(data.notification);
      notificationType = notificationData?.notification_type || '';
      console.log('[ExpoBackgroundHandler] Method 2 - notification_type:', notificationType);
    } catch (e) {
      console.warn('[ExpoBackgroundHandler] Failed to parse legacy notification:', e);
    }
  }

  // Method 3: Direct notification_type in data
  if (!notificationType && data.notification_type) {
    notificationType = data.notification_type;
    notificationData = data;
    console.log('[ExpoBackgroundHandler] Method 3 - notification_type from data:', notificationType);
  }

  // Get content based on notification type
  let title = 'AlooChat';
  let body = 'You have a new notification';

  if (notificationType && notificationData) {
    console.log('[ExpoBackgroundHandler] Using getNotificationContent for type:', notificationType);
    const content = getNotificationContent(notificationType, notificationData);
    title = content.title;
    body = content.body;
    channelId = content.channelId;
  } else {
    // Fallback to FCM notification or direct data fields
    console.log('[ExpoBackgroundHandler] Using fallback extraction');
    title = fcmNotification.title || data.title || data.push_message_title || 'AlooChat';
    body = fcmNotification.body || data.body || data.push_message_body || data.message || 'You have a new notification';
  }

  // Build data payload for navigation
  const conversationId = notificationData?.primary_actor?.conversation_id || 
                         notificationData?.primary_actor?.id || 
                         data.conversation_id || 
                         data.conversationId || '';

  console.log('[ExpoBackgroundHandler] Final notification:', { title, body, notificationType, conversationId });
  console.log('[ExpoBackgroundHandler] ================================');

  return { 
    title, 
    body, 
    data: {
      ...data,
      conversationId: String(conversationId),
      notificationType,
    },
    channelId,
    notificationType,
  };
}

/**
 * Display notification using expo-notifications
 */
async function displayBackgroundNotification(
  title: string,
  body: string,
  data: any,
  channelId: string = CHANNEL_ID.MESSAGES
): Promise<void> {
  try {
    await ensureChannels();

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId }),
      },
      trigger: null,
    });

    console.log('[ExpoBackgroundHandler] ✅ Notification displayed:', title, '| Type:', data?.notificationType);
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

    const { title, body, data, channelId, notificationType } = parsePayload(remoteMessage);
    
    console.log('[ExpoBackgroundHandler] Parsed notification type:', notificationType);
    
    // Only display if there's no notification payload (data-only message)
    // Messages with notification payload are auto-displayed by the system
    if (!remoteMessage?.notification) {
      await displayBackgroundNotification(title, body, data, channelId);
    }
  });

  console.log('[ExpoBackgroundHandler] ✅ Background handler registered');
}

// Register immediately when this module is imported
registerBackgroundHandler();

export { displayBackgroundNotification, parsePayload };
