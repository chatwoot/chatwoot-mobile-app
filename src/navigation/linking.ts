import { CHATWOOT_APP_URL } from '@/constants';

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
