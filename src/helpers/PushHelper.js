import { Platform } from 'react-native';
import { NOTIFICATION_TYPES } from '@/constants';
import notifee from '@notifee/react-native';

export const clearAllDeliveredNotifications = () => {
  if (Platform.OS === 'android') {
  } else {
    notifee.cancelAllNotifications();
  }
};

export const updateBadgeCount = ({ count = 0 }) => {
  if (Platform.OS === 'ios' && count > 0) {
    notifee.setBadgeCount(count);
  }
};

export const findConversationLinkFromPush = ({ notification, installationUrl }) => {
  const { notification_type } = notification;

  if (NOTIFICATION_TYPES.includes(notification_type)) {
    const { primary_actor, primary_actor_id, primary_actor_type } = notification;
    let conversationId = null;
    if (primary_actor_type === 'Conversation') {
      conversationId = primary_actor.id;
    } else if (primary_actor_type === 'Message') {
      conversationId = primary_actor.conversation_id;
    }
    if (conversationId) {
      const conversationLink = `${installationUrl}/app/accounts/1/conversations/${conversationId}/${primary_actor_id}/${primary_actor_type}`;
      return conversationLink;
    }
  }
  return;
};

export const findNotificationFromFCM = ({ message }) => {
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
