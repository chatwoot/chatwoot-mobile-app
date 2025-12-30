import { Platform } from 'react-native';
import { NOTIFICATION_TYPES } from '@/constants';
import { Notification } from '@/types/Notification';

let notifee: any = null;

if (Platform.OS === 'ios') {
  try {
    notifee = require('@notifee/react-native').default;
  } catch (e) {
    console.warn('@notifee/react-native not available');
  }
}

export const clearAllDeliveredNotifications = async () => {
  if (Platform.OS === 'ios' && notifee) {
    await notifee.cancelAllNotifications();
  }
};

export const updateBadgeCount = async ({ count = 0 }) => {
  if (Platform.OS === 'ios' && count >= 0 && notifee) {
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
  else if (message?.data?.notification) {
    notification = JSON.parse(message.data.notification);
  }
  return notification;
};
