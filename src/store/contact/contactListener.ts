// This listener adds the contacts to the store when there are new conversations are added to the store. It may be created in bulk or individually.

import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { conversationActions } from '../conversation/conversationActions';
import { isOutdatedConversationUpdate } from '../conversation/conversationSlice';
import { notificationActions } from '../notification/notificationAction';
import { addNotification } from '../notification/notificationSlice';
import { addContact, addContacts, updateContact, updateContactsPresence } from './contactSlice';
import { Conversation } from '@/types/Conversation';
import { Contact } from '@/types/Contact';
import type { AvailabilityStatus } from '@/types/common/AvailabilityStatus';
import { Notification } from '@/types/Notification';
import type { ConversationListResponse } from '../conversation/conversationTypes';
import type {
  NotificationCreatedResponse,
  NotificationResponse,
} from '../notification/notificationTypes';

export const contactListenerMiddleware = createListenerMiddleware();

// The `meta.sender` embedded in a conversation response is a snapshot rendered
// when the server handled the request, while the same contact can be written
// while that request is still in flight: a websocket `contact.updated` event,
// a conversations-list / notification response, or a fresher detail snapshot
// from an overlapping request. Contact payloads carry no updated-at timestamp
// shared by all sources, so ordering is fenced with markers recorded as events
// are processed:
// - fetch start, keyed by thunk requestId — several conversation fetches can
//   be in flight at once (inbox notifications and the chat screen dispatch it);
// - last contact write, keyed by contact id — every source above records its
//   store writes here; writes fire for any contact in the account, so only
//   writes for the fetched contact matter;
// - last presence write, global and per contact — one `presence.update`
//   rewrites the availability of every stored contact at once, but the store
//   only holds contacts that already exist, so the event's per-contact value
//   is kept here for senders that aren't stored yet.
// Markers compare by a monotonic sequence token: two events can be processed
// within the same millisecond, where wallclock values would tie.
let lastSequence = 0;
const nextSequence = () => {
  lastSequence += 1;
  return lastSequence;
};

interface TrackedEvent {
  // Wallclock, for the TTL sweep only — ordering uses `order`.
  at: number;
  order: number;
}

const fetchStartOrderByRequestId = new Map<string, number>();
const lastContactWriteById = new Map<number, TrackedEvent>();
let lastPresenceWrite: TrackedEvent | undefined;
const lastPresenceByContactId = new Map<number, TrackedEvent & { status: AvailabilityStatus }>();

// Contact writes land on every message activity (websocket events, list and
// notification refreshes), so keep the tracking maps bounded.
export const MAX_TRACKED_CONTACT_WRITES = 500;
const CONTACT_WRITE_TTL_MS = 10 * 60 * 1000;

// Refreshing an existing key never grows the map — make room only when a new
// key needs a slot, so re-writing a recent contact can't evict someone else's
// entry (e.g. one fencing an in-flight fetch). A burst of distinct contacts
// inside the TTL expires nothing; drop the least recently refreshed entries so
// the insert can't grow the map past the cap. Iteration order is insertion
// order — and every refresh re-inserts its entry, so the front of the map is
// the oldest entry.
const makeRoomForNewKey = <V extends { at: number }>(map: Map<number, V>, now: number) => {
  if (map.size < MAX_TRACKED_CONTACT_WRITES) {
    return;
  }
  map.forEach((tracked, id) => {
    if (now - tracked.at > CONTACT_WRITE_TTL_MS) {
      map.delete(id);
    }
  });
  while (map.size >= MAX_TRACKED_CONTACT_WRITES) {
    const oldest = map.keys().next();
    if (oldest.done) {
      break;
    }
    map.delete(oldest.value);
  }
};

const refreshTracked = <V extends TrackedEvent>(map: Map<number, V>, id: number, value: V) => {
  if (!map.has(id)) {
    makeRoomForNewKey(map, value.at);
  }
  map.delete(id);
  map.set(id, value);
};

const trackContactWrite = (contactId: number) => {
  refreshTracked(lastContactWriteById, contactId, {
    at: Date.now(),
    order: nextSequence(),
  });
};

contactListenerMiddleware.startListening({
  matcher: conversationActions.fetchConversation.pending.match,
  effect: action => {
    fetchStartOrderByRequestId.set(action.meta.requestId, nextSequence());
  },
});

contactListenerMiddleware.startListening({
  matcher: conversationActions.fetchConversation.rejected.match,
  effect: action => {
    fetchStartOrderByRequestId.delete(action.meta.requestId);
  },
});

contactListenerMiddleware.startListening({
  matcher: updateContact.match,
  effect: action => {
    trackContactWrite(action.payload.id);
  },
});

contactListenerMiddleware.startListening({
  matcher: updateContactsPresence.match,
  effect: action => {
    const { contacts } = action.payload as { contacts: Record<number, AvailabilityStatus> };
    const tracked: TrackedEvent = { at: Date.now(), order: nextSequence() };
    lastPresenceWrite = tracked;
    Object.entries(contacts).forEach(([contactId, rawStatus]) => {
      // Mirror the reducer's fallback so the recorded value matches what a
      // stored contact would have received from this event.
      refreshTracked(lastPresenceByContactId, Number(contactId), {
        ...tracked,
        status: rawStatus || 'offline',
      });
    });
  },
});

contactListenerMiddleware.startListening({
  matcher: isAnyOf(conversationActions.fetchConversations.fulfilled),
  effect: (action, listenerApi) => {
    const { conversations } = action.payload as ConversationListResponse;
    const contacts = conversations.map((conversation: Conversation) => conversation.meta.sender);
    if (contacts.length > 0) {
      listenerApi.dispatch(addContacts({ contacts }));
      // These are store writes as well: a list response processed while a
      // conversation fetch is in flight is fresher evidence than that fetch's
      // snapshot, so the fence must see it like any other write.
      contacts.forEach(contact => {
        if (contact) {
          trackContactWrite(contact.id);
        }
      });
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
    const fetchStartOrder = fetchStartOrderByRequestId.get(action.meta.requestId);
    fetchStartOrderByRequestId.delete(action.meta.requestId);

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
    // was in flight — a websocket `contact.updated`, a conversations-list /
    // notification response, or a fresher snapshot from an overlapping fetch
    // of the same conversation (a repeat press dispatches a second request
    // while the first is still in flight). Either way the stored copy is
    // newer than this response's data. Writes to other contacts don't matter.
    const lastContactWrite = lastContactWriteById.get(contact.id);
    if (
      fetchStartOrder !== undefined &&
      lastContactWrite !== undefined &&
      lastContactWrite.order > fetchStartOrder
    ) {
      return;
    }

    // Availability is live data: the snapshot carries the value rendered when
    // the server handled the request. Keep the stored value only when a
    // `presence.update` actually landed during this fetch — without a socket
    // (or right after launch, from rehydrated storage) the stored status can
    // be arbitrarily old, and the snapshot is then the freshest evidence.
    // Prefer the event's own value for this contact: the reducer only updates
    // contacts that are already stored, so for a sender that isn't stored yet
    // the event value survives only in the tracking above.
    let storedAvailability: AvailabilityStatus | undefined;
    if (
      fetchStartOrder !== undefined &&
      lastPresenceWrite !== undefined &&
      lastPresenceWrite.order > fetchStartOrder
    ) {
      const presenceEvent = lastPresenceByContactId.get(contact.id);
      storedAvailability =
        presenceEvent && presenceEvent.order > fetchStartOrder
          ? presenceEvent.status
          : state.contacts.entities[contact.id]?.availabilityStatus;
    }
    listenerApi.dispatch(
      addContact({
        ...contact,
        availabilityStatus: storedAvailability ?? contact.availabilityStatus,
      }),
    );

    // Record the snapshot as a contact write: an overlapping fetch that
    // started earlier must not overwrite it when its own older response
    // arrives later.
    trackContactWrite(contact.id);
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
      contacts.forEach(contact => {
        if (contact) {
          trackContactWrite(contact.id);
        }
      });
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
      trackContactWrite(contact.id);
    }
  },
});
