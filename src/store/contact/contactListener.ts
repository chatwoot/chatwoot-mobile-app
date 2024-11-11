import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { conversationActions } from '../conversation/conversationActions';
import { addContacts } from './contactSlice';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(conversationActions.fetchConversations.fulfilled),
  effect: (action, listenerApi) => {
    const { payload } = action;
    const { conversations } = payload;
    listenerApi.dispatch(addContacts({ conversations }));
  },
});
