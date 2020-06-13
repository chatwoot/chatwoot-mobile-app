import { store } from '../store';
import { navigate } from './NavigationHelper';

export const handlePush = async ({ remoteMessage }) => {
  try {
    const { notification } = remoteMessage.data;
    const pushData = JSON.parse(notification);
    const state = await store.getState();
    const { isLoggedIn } = state.auth;
    const { notification_type } = pushData;
    // console.log('pushData', pushData);

    // Check user is logged or not
    if (
      isLoggedIn &&
      (notification_type === 'conversation_creation' ||
        notification_type.type === 'conversation_assignment')
    ) {
      const {
        primary_actor: { id: conversationId },
      } = pushData;

      setTimeout(() => {
        navigate(
          'ChatScreen',
          {
            conversationId,
          },
          `ChatScreen+${conversationId}`,
        );
      }, 1000);
    }
    return isLoggedIn;
  } catch {}
};
