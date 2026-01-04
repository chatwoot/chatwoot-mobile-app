// index.js - Entry point for React Native
// IMPORTANT: Background message handler MUST be registered here BEFORE AppRegistry.registerComponent()
// See: https://rnfirebase.io/messaging/usage#background--quit-state-messages

import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// Channel ID - must match across the app
const CHANNEL_ID = 'aloochat_messages';

// Create notification channel for Android
async function createChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Chat Messages',
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
    });
  }
}

// Display notification using Notifee
async function displayNotification(title, body, data) {
  try {
    await createChannel();
    
    await notifee.displayNotification({
      title: title || 'AlooChat',
      body: body || 'You have a new message',
      data: data || {},
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        color: '#1F93FF',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [300, 500],
      },
      ios: {
        sound: 'default',
      },
    });
    console.log('[index.js] Notification displayed:', title);
  } catch (error) {
    console.error('[index.js] Failed to display notification:', error);
  }
}

// Parse notification data from various FCM payload formats
function parseNotificationData(remoteMessage) {
  let title = 'AlooChat';
  let body = 'You have a new message';
  let data = {};

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
        console.warn('[index.js] Failed to parse payload:', e);
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
        console.warn('[index.js] Failed to parse legacy notification:', e);
      }
    }

    // Method 4: Direct data fields
    if (remoteMessage?.data) {
      if (remoteMessage.data.title && !remoteMessage.notification) title = remoteMessage.data.title;
      if (remoteMessage.data.body && !remoteMessage.notification) body = remoteMessage.data.body;
      if (remoteMessage.data.message) body = remoteMessage.data.message;
    }
  } catch (error) {
    console.error('[index.js] Error parsing notification data:', error);
  }

  return { title, body, data };
}

// Register background message handler - MUST be done before AppRegistry.registerComponent()
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[index.js] ====== BACKGROUND MESSAGE RECEIVED ======');
  console.log('[index.js] Message:', JSON.stringify(remoteMessage, null, 2));

  try {
    const { title, body, data } = parseNotificationData(remoteMessage);
    console.log('[index.js] Parsed - Title:', title, 'Body:', body);
    
    await displayNotification(title, body, data);
  } catch (error) {
    console.error('[index.js] Background handler error:', error);
    // Fallback - still try to show something
    await displayNotification('AlooChat', 'You have a new notification', {});
  }
  
  console.log('[index.js] ====== HANDLER COMPLETE ======');
});

console.log('[index.js] Background message handler registered');

// Register Notifee background event handler for notification actions
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('[index.js] Notifee background event:', type, detail?.notification?.id);
});

// Import and register the main app component
// Using dynamic import to ensure background handler is registered first
import App from './App';

// Check if app was launched in background (iOS only)
function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App launched in background by iOS for background message handling
    console.log('[index.js] App launched in headless mode (iOS background)');
    return null;
  }
  return <App />;
}

AppRegistry.registerComponent('main', () => HeadlessCheck);

// Also register with expo's expected component name
AppRegistry.registerComponent('AlooChat', () => HeadlessCheck);
