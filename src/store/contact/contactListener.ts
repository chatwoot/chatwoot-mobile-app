import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { conversationActions } from '../conversation/conversationActions';
import { addContact, addContacts } from './contactSlice';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(conversationActions.fetchConversations.fulfilled),
  effect: (action, listenerApi) => {
    const { payload } = action;
    const { conversations } = payload;
    listenerApi.dispatch(addContacts({ conversations }));
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(conversationActions.fetchConversation.fulfilled),
  effect: (action, listenerApi) => {
    const { payload } = action;
    listenerApi.dispatch(addContact(payload.conversation));
  },
});
