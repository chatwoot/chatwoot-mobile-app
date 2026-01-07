/**
 * Background message handler using expo-notifications
 * This file should be imported at the top of App.tsx
 */

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

// Background notification task name
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

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
      enableLights: true,
      enableVibrate: true,
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
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
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
 * Define the background notification task
 * This handles notifications received when app is in background
 */
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }: { data: any; error: any; executionInfo: any }) => {
  console.log('[ExpoBackgroundHandler] 🔔 Background task triggered');
  
  if (error) {
    console.error('[ExpoBackgroundHandler] Background task error:', error);
    return;
  }
  
  if (data) {
    console.log('[ExpoBackgroundHandler] Background notification data:', JSON.stringify(data));
    // The notification is already displayed by the system when it has notification payload
    // This task is for handling the data payload for navigation etc.
  }
});

/**
 * Register background message handler
 */
function registerBackgroundHandler(): void {
  // Register expo-notifications background task
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK)
    .then(() => {
      console.log('[ExpoBackgroundHandler] ✅ Expo background task registered');
    })
    .catch((error) => {
      console.warn('[ExpoBackgroundHandler] Failed to register Expo background task:', error);
    });

  // Also try Firebase if available (for production builds)
  const firebaseMessaging = getMessaging();
  
  if (firebaseMessaging) {
    try {
      firebaseMessaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
        console.log('[ExpoBackgroundHandler] 🔔 ====== BACKGROUND MESSAGE ======');
        console.log('[ExpoBackgroundHandler] Time:', new Date().toISOString());
        console.log('[ExpoBackgroundHandler] Raw message:', JSON.stringify(remoteMessage, null, 2));

        try {
          const { title, body, data, channelId, notificationType } = parsePayload(remoteMessage);
          
          console.log('[ExpoBackgroundHandler] Parsed:', { title, body, notificationType });
          
          // Filter out AI bot messages and outgoing messages
          const messageType = remoteMessage?.data?.message_type || remoteMessage?.data?.messageType;
          const senderType = remoteMessage?.data?.sender_type || remoteMessage?.data?.senderType;
          
          // Only show notification for incoming messages from real users
          // messageType: 0 = incoming, 1 = outgoing
          // senderType: 'Contact' = real user, 'agent_bot' = AI bot
          const shouldShowNotification = 
            messageType === '0' || messageType === 0 || messageType === undefined;
          const isNotBot = senderType !== 'agent_bot' && senderType !== 'AgentBot';
          
          if (shouldShowNotification && isNotBot) {
            // CRITICAL: Always display notification for background/killed state
            // iOS/Android may not auto-display data-only messages
            console.log('[ExpoBackgroundHandler] Displaying notification...');
            await displayBackgroundNotification(title, body, data, channelId);
            console.log('[ExpoBackgroundHandler] ✅ Background notification displayed');
          } else {
            console.log('[ExpoBackgroundHandler] ⏭️ Skipped notification - outgoing or bot message');
          }
        } catch (parseError) {
          console.error('[ExpoBackgroundHandler] Parse error:', parseError);
          // Fallback: show basic notification
          await displayBackgroundNotification(
            remoteMessage?.notification?.title || 'AlooChat',
            remoteMessage?.notification?.body || 'You have a new message',
            remoteMessage?.data || {},
            CHANNEL_ID.MESSAGES
          );
        }
        
        console.log('[ExpoBackgroundHandler] ====== HANDLER COMPLETE ======');
      });
      console.log('[ExpoBackgroundHandler] ✅ Firebase background handler registered');
    } catch (error) {
      console.warn('[ExpoBackgroundHandler] Firebase handler error:', error);
    }
  } else {
    console.warn('[ExpoBackgroundHandler] Firebase messaging not available - background notifications may not work');
  }
}

// CRITICAL: Auto-register when module loads (App.tsx imports this at the top)
console.log('[ExpoBackgroundHandler] 🚀 Module loaded - registering handlers...');
registerBackgroundHandler();
console.log('[ExpoBackgroundHandler] ✅ Handlers registered');

// Export for manual registration if needed
export { registerBackgroundHandler, displayBackgroundNotification, parsePayload };
