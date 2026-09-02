import { getStateFromPath } from '@react-navigation/native';

import { CHATWOOT_APP_URL } from '@/constants';

type ConversationLinkParams = {
  accountId: number;
  conversationId: number;
  primaryActorId?: number;
  primaryActorType?: string;
};

export const getLinkingPrefixes = (installationUrl: string) => [installationUrl, CHATWOOT_APP_URL];

export const linkingConfig = {
  screens: {
    ChatScreen: {
      path: 'app/accounts/:accountId/conversations/:conversationId/:primaryActorId?/:primaryActorType?',
      parse: {
        accountId: (accountId: string) => parseInt(accountId),
        conversationId: (conversationId: string) => parseInt(conversationId),
        primaryActorId: (primaryActorId: string) => parseInt(primaryActorId),
        primaryActorType: (primaryActorType: string) => decodeURIComponent(primaryActorType),
      },
    },
  },
};

export const getConversationParamsFromPath = (path: string): ConversationLinkParams | null => {
  const state = getStateFromPath(path, linkingConfig);
  const route = state?.routes[0];

  if (route?.name !== 'ChatScreen') {
    return null;
  }

  const params = route.params as ConversationLinkParams | undefined;
  if (!params || !Number.isInteger(params.accountId) || !Number.isInteger(params.conversationId)) {
    return null;
  }

  return params;
};
