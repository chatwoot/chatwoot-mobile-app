import { Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { NOTIFICATION_TYPES } from '@/constants';
import { Notification } from '@/types/Notification';

// Android notification channel that all Chatwoot push notifications are posted to.
// On Android 8.0+ an app only appears in system menus such as "Do Not Disturb"
// app exceptions and per-app custom notification sounds once it has registered at
// least one notification channel, so we create this channel on startup.
// This id must stay in sync with the default channel declared for Firebase
// Messaging in with-android-notification-channel.js.
export const ANDROID_DEFAULT_CHANNEL_ID = 'default';
export const ANDROID_DEFAULT_CHANNEL_NAME = 'Notifications';

export const createDefaultNotificationChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }
  await notifee.createChannel({
    id: ANDROID_DEFAULT_CHANNEL_ID,
    name: ANDROID_DEFAULT_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
  });
};

export const clearAllDeliveredNotifications = async () => {
  if (Platform.OS === 'ios') {
    await notifee.cancelAllNotifications();
  }
};

export const updateBadgeCount = async ({ count = 0 }) => {
  if (Platform.OS === 'ios' && count >= 0) {
    await notifee.setBadgeCount(count);
  }
};

export const findConversationLinkFromPush = ({
  notification,
  installationUrl,
}: {
  notification: Notification;
  installationUrl: string;
}) => {
  const { notificationType } = notification;

  if (NOTIFICATION_TYPES.includes(notificationType)) {
    const { primaryActor, primaryActorId, primaryActorType } = notification;
    let conversationId = null;
    if (primaryActorType === 'Conversation') {
      conversationId = primaryActor.id;
    } else if (primaryActorType === 'Message') {
      conversationId = primaryActor.conversationId;
    }
    if (conversationId) {
      const conversationLink = `${installationUrl}/app/accounts/1/conversations/${conversationId}/${primaryActorId}/${primaryActorType}`;
      return conversationLink;
    }
  }
  return;
};

interface FCMMessage {
  data?: {
    payload?: string;
    notification?: string;
  };
}

export const findNotificationFromFCM = ({ message }: { message: FCMMessage }) => {
  let notification = null;
  // FCM HTTP v1
  if (message?.data?.payload) {
    const parsedPayload = JSON.parse(message.data.payload);
    notification = parsedPayload.data.notification;
  }
  // FCM legacy. It will be deprecated soon
  else {
    notification = JSON.parse(message.data.notification);
  }
  return notification;
};
