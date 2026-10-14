// This listener adds the contacts to the store when there are new conversations are added to the store. It may be created in bulk or individually.

import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { conversationActions } from '../conversation/conversationActions';
import { isOutdatedConversationUpdate } from '../conversation/conversationSlice';
import { notificationActions } from '../notification/notificationAction';
import { addNotification } from '../notification/notificationSlice';
import { addContact, addContacts } from './contactSlice';
import { Conversation } from '@/types/Conversation';
import { Notification } from '@/types/Notification';
import type { ConversationListResponse } from '../conversation/conversationTypes';
import type {
  NotificationCreatedResponse,
  NotificationResponse,
} from '../notification/notificationTypes';

export const contactListenerMiddleware = createListenerMiddleware();

contactListenerMiddleware.startListening({
  matcher: isAnyOf(conversationActions.fetchConversations.fulfilled),
  effect: (action, listenerApi) => {
    const { conversations } = action.payload as ConversationListResponse;
    const contacts = conversations.map((conversation: Conversation) => conversation.meta.sender);
    if (contacts.length > 0) {
      listenerApi.dispatch(addContacts({ contacts }));
    }
  },
});

contactListenerMiddleware.startListening({
  matcher: isAnyOf(conversationActions.fetchConversation.fulfilled),
  effect: (action, listenerApi) => {
    // The thunk resolves to `{ conversation }` — the same shape the
    // conversation slice reducer destructures. Reading `payload.meta` here
    // was always undefined, so the contact was never refreshed when a
    // conversation was opened.
    const { conversation } = action.payload as { conversation: Conversation };

    // Mirror the conversation reducer's staleness guard: when this response
    // is older than the snapshot already in the store (e.g. a slow fetch
    // completing after a newer conversations-list refresh), the conversation
    // store discards it — its stale meta.sender must not overwrite a
    // fresher contact either.
    const state = listenerApi.getState() as {
      conversations: { entities: Record<number, Conversation | undefined> };
    };
    if (isOutdatedConversationUpdate(state.conversations.entities[conversation.id], conversation)) {
      return;
    }

    const contact = conversation?.meta?.sender;
    if (contact) {
      listenerApi.dispatch(addContact(contact));
    }
  },
});

contactListenerMiddleware.startListening({
  matcher: isAnyOf(notificationActions.fetchNotifications.fulfilled),
  effect: (action, listenerApi) => {
    const { payload: notifications } = action.payload as NotificationResponse;
    const conversationNotifications = notifications.filter(
      (notification: Notification) =>
        notification.primaryActorType === 'Conversation' && notification.primaryActor?.meta?.sender,
    );
    const contacts = conversationNotifications.map(
      (notification: Notification) => notification.primaryActor?.meta?.sender,
    );
    if (contacts.length > 0) {
      listenerApi.dispatch(addContacts({ contacts }));
    }
  },
});

contactListenerMiddleware.startListening({
  matcher: isAnyOf(addNotification),
  effect: (action, listenerApi) => {
    const { notification } = action.payload as NotificationCreatedResponse;
    const contact = notification?.primaryActor?.meta?.sender;
    if (contact) {
      listenerApi.dispatch(addContact(contact));
    }
  },
});
