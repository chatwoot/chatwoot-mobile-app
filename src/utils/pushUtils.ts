import { Platform } from 'react-native';
import { NOTIFICATION_TYPES } from '@/constants';
import notifee from '@notifee/react-native';
import { Notification } from '@/types/Notification';

export const clearAllDeliveredNotifications = () => {
  if (Platform.OS === 'android') {
  } else {
    notifee.cancelAllNotifications();
  }
};

export const updateBadgeCount = ({ count = 0 }) => {
  if (Platform.OS === 'ios' && count >= 0) {
    notifee.setBadgeCount(count);
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

/* Firebase functionality disabled
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findNotificationFromFCM = ({ message }: { message: any }) => {
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
*/

// Firebase functionality disabled - stub implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findNotificationFromFCM = ({ message }: { message: any }) => {
  console.log('Firebase disabled - FCM notifications not available', message);
  return null;
};
