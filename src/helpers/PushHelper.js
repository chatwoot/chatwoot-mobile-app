// import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { store } from '../store';
import { navigate } from './NavigationHelper';
import { Platform } from 'react-native';

export const handlePush = async ({ remoteMessage, type }) => {
  try {
    const { notification } = remoteMessage.data;
    const pushData = JSON.parse(notification);
    const state = await store.getState();
    const { isLoggedIn } = state.auth;
    const { notification_type } = pushData;

    // Check user is logged or not
    if (
      type !== 'foreground' &&
      isLoggedIn &&
      (notification_type === 'conversation_creation' ||
        notification_type === 'conversation_assignment' ||
        notification_type === 'assigned_conversation_new_message')
    ) {
      const {
        primary_actor: { id: conversationId },
        primary_actor_id,
        primary_actor_type,
      } = pushData;

      navigate(
        'ChatScreen',
        {
          conversationId,
          primaryActorDetails: { primary_actor_id, primary_actor_type },
        },

        `ChatScreen+${conversationId}`,
      );
    }
    return isLoggedIn;
  } catch {}
};

export const clearAllDeliveredNotifications = () => {
  if (Platform.OS === 'android') {
  } else {
    PushNotificationIOS.removeAllDeliveredNotifications();
  }
};

export const updateBadgeCount = ({ count }) => {
  if (Platform.OS === 'android') {
  } else {
    PushNotificationIOS.setApplicationIconBadgeNumber(count);
  }
};
