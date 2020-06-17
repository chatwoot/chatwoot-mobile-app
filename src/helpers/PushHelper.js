import { store } from '../store';
import { navigate } from './NavigationHelper';

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
        notification_type === 'conversation_assignment')
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
