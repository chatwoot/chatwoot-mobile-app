// This listener adds the contacts to the store when there are new conversations are added to the store. It may be created in bulk or individually.

import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { conversationActions } from '../conversation/conversationActions';
import { isOutdatedConversationUpdate } from '../conversation/conversationSlice';
import { notificationActions } from '../notification/notificationAction';
import { addNotification } from '../notification/notificationSlice';
import { addContact, addContacts, updateContact } from './contactSlice';
import { Conversation } from '@/types/Conversation';
import { Contact } from '@/types/Contact';
import { Notification } from '@/types/Notification';
import type { ConversationListResponse } from '../conversation/conversationTypes';
import type {
  NotificationCreatedResponse,
  NotificationResponse,
} from '../notification/notificationTypes';

export const contactListenerMiddleware = createListenerMiddleware();

// The `meta.sender` embedded in a conversation response is a snapshot rendered
// when the server handled the request, while the same contact can be written
// by a websocket `contact.updated` event while that request is still in
// flight. Contact payloads carry no updated-at timestamp shared by all
// sources, so the ordering is fenced with wallclock markers instead:
// - fetch start, keyed by thunk requestId — several conversation fetches can
//   be in flight at once (inbox notifications and the chat screen dispatch it);
// - last contact write, keyed by contact id — `contact.updated` fires for any
//   contact in the account, so only writes for the fetched contact matter.
const fetchStartedAtByRequestId = new Map<string, number>();
const lastContactWriteAtById = new Map<number, number>();

// `contact.updated` fires on every message activity, so keep the map bounded.
const MAX_TRACKED_CONTACT_WRITES = 500;
const CONTACT_WRITE_TTL_MS = 10 * 60 * 1000;

const trackContactWrite = (contactId: number) => {
  const now = Date.now();
  if (lastContactWriteAtById.size >= MAX_TRACKED_CONTACT_WRITES) {
    lastContactWriteAtById.forEach((writtenAt, id) => {
      if (now - writtenAt > CONTACT_WRITE_TTL_MS) {
        lastContactWriteAtById.delete(id);
      }
    });
  }
  lastContactWriteAtById.set(contactId, now);
};

contactListenerMiddleware.startListening({
  matcher: conversationActions.fetchConversation.pending.match,
  effect: action => {
    fetchStartedAtByRequestId.set(action.meta.requestId, Date.now());
  },
});

contactListenerMiddleware.startListening({
  matcher: conversationActions.fetchConversation.rejected.match,
  effect: action => {
    fetchStartedAtByRequestId.delete(action.meta.requestId);
  },
});

contactListenerMiddleware.startListening({
  matcher: updateContact.match,
  effect: action => {
    trackContactWrite(action.payload.id);
  },
});

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
  matcher: conversationActions.fetchConversation.fulfilled.match,
  effect: (action, listenerApi) => {
    // The thunk resolves to `{ conversation }` — the same shape the
    // conversation slice reducer destructures. Reading `payload.meta` here
    // was always undefined, so the contact was never refreshed when a
    // conversation was opened.
    const { conversation } = action.payload;

    // Consume this request's marker up front — it's only meaningful for this
    // one fulfillment.
    const fetchStartedAt = fetchStartedAtByRequestId.get(action.meta.requestId);
    fetchStartedAtByRequestId.delete(action.meta.requestId);

    // Mirror the conversation reducer's staleness guard: when this response
    // is older than the snapshot already in the store (e.g. a slow fetch
    // completing after a newer conversations-list refresh), the conversation
    // store discards it — its stale meta.sender must not overwrite a
    // fresher contact either.
    const state = listenerApi.getState() as {
      conversations: { entities: Record<number, Conversation | undefined> };
      contacts: { entities: Record<number, Contact | undefined> };
    };
    if (isOutdatedConversationUpdate(state.conversations.entities[conversation.id], conversation)) {
      return;
    }

    const contact = conversation?.meta?.sender;
    if (!contact) {
      return;
    }

    // Skip the snapshot when this exact contact was written while the request
    // was in flight (websocket `contact.updated`) — the stored contact is then
    // newer than the response data. Writes to other contacts don't matter.
    const lastContactWriteAt = lastContactWriteAtById.get(contact.id);
    if (
      fetchStartedAt !== undefined &&
      lastContactWriteAt !== undefined &&
      lastContactWriteAt > fetchStartedAt
    ) {
      return;
    }

    // Availability is live data: presence heartbeats rewrite it for all
    // contacts every ~20s, and the snapshot was rendered before the request
    // resolved — keep the stored value instead of the render-time one.
    const { availabilityStatus } = state.contacts.entities[contact.id] ?? {};
    listenerApi.dispatch(
      addContact({
        ...contact,
        availabilityStatus: availabilityStatus ?? contact.availabilityStatus,
      }),
    );
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
