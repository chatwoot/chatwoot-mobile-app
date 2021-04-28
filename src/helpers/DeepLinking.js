import { store } from '../store';
import { checkUrlIsConversation } from './UrlHelper';
import { navigate } from './NavigationHelper';

export const doDeepLinking = async ({ url }) => {
  try {
    const state = await store.getState();
    const { isLoggedIn, user: userDetails } = state.auth;
    // Check user is logged or not
    if (isLoggedIn) {
      const { account_id: accountId } = userDetails;
      const isConversationURL = await checkUrlIsConversation({
        url,
      });
      if (isConversationURL) {
        const urlParams = url.split('/');
        const parsedAccountId = parseInt(urlParams[5]);
        const conversationId = parseInt(urlParams[7]);
        // Check account id and opened conversation account id are same
        if (parsedAccountId === accountId) {
          navigate(
            'ChatScreen',
            {
              conversationId,
            },
            `ChatScreen+${conversationId}`,
          );
        }
      }
    }
    return isLoggedIn;
  } catch {}
};
