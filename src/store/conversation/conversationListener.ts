import { createListenerMiddleware, isAnyOf, type UnknownAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react-native';

import type { RootState } from '@/store';
import { selectChatwootVersion } from '@/store/settings/settingsSelectors';
import type { Conversation } from '@/types';
import { hasConversationId } from '@/utils/conversationUtils';

import { conversationActions } from './conversationActions';
import { addConversation, updateConversation } from './conversationSlice';

export const conversationListenerMiddleware = createListenerMiddleware();

const MAX_REPORTED_KEYS = 10;

const conversationsIn = (action: UnknownAction): unknown[] => {
  if (conversationActions.fetchConversations.fulfilled.match(action)) {
    return action.payload.conversations;
  }
  if (conversationActions.fetchConversation.fulfilled.match(action)) {
    return [action.payload.conversation];
  }
  return [action.payload];
};

conversationListenerMiddleware.startListening({
  matcher: isAnyOf(
    addConversation,
    updateConversation,
    conversationActions.fetchConversation.fulfilled,
    conversationActions.fetchConversations.fulfilled,
  ),
  effect: (action, listenerApi) => {
    const withoutId = conversationsIn(action).filter(
      conversation => !hasConversationId(conversation as Conversation),
    );
    if (!withoutId.length) return;

    const [sample] = withoutId;
    Sentry.captureMessage('Conversation without an id', {
      extra: {
        action: action.type,
        count: withoutId.length,
        payloadType: sample === null ? 'null' : typeof sample,
        keys:
          sample && typeof sample === 'object'
            ? Object.keys(sample).slice(0, MAX_REPORTED_KEYS)
            : [],
        serverVersion: selectChatwootVersion(listenerApi.getState() as RootState),
      },
    });
  },
});
