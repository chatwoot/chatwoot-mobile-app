import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import { NOTIFICATION_TYPES } from 'constants';

export const clearAllDeliveredNotifications = () => {
  if (Platform.OS === 'android') {
  } else {
    PushNotificationIOS.removeAllDeliveredNotifications();
  }
};

export const updateBadgeCount = ({ count = 0 }) => {
  if (Platform.OS === 'ios') {
    PushNotificationIOS.setApplicationIconBadgeNumber(count);
  }
};

export const findConversationLinkFromPush = ({ notification, installationUrl }) => {
  const pushData = JSON.parse(notification);

  const { notification_type } = pushData;

  if (NOTIFICATION_TYPES.includes(notification_type)) {
    const { primary_actor, primary_actor_id, primary_actor_type } = pushData;
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
