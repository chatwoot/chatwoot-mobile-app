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
// a conversations-list / notification response, a direct upsert (e.g. the full
// contact record fetched by the search screen), or a fresher detail snapshot
// from an overlapping request. Contact payloads carry no updated-at timestamp
// shared by all sources, so ordering is fenced with markers recorded as events
// are processed:
// - request start, keyed by thunk requestId — detail fetches (inbox
//   notifications and the chat screen dispatch it), conversations-list and
//   notifications-list requests can all overlap with one another;
// - last contact write, keyed by contact id — every source above records its
//   store writes here; writes fire for any contact in the account, so only
//   writes for the fetched contact matter. A fulfilled snapshot — from a
//   detail fetch or a list response — is recorded under its own request's
//   start order: requests that started earlier must still be fenced by it,
//   while ones that started later hold fresher data and must not be. Live
//   websocket writes get a fresh sequence: they arrive after every request
//   in flight began;
// - last presence event, global — one `presence.update` rewrites the
//   availability of every stored contact from a full snapshot: contacts named
//   in its payload get that value, the rest fall back to offline. Only the
//   latest event is live evidence, and the store only holds contacts that
//   already exist, so its payload is kept verbatim for senders that aren't
//   stored yet.
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
let lastPresenceEvent:
  | (TrackedEvent & { contacts: Record<number, AvailabilityStatus> })
  | undefined;

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

const trackContactWriteAt = (contactId: number, at: number, order: number) => {
  refreshTracked(lastContactWriteById, contactId, { at, order });
};

const trackContactWrite = (contactId: number) => {
  trackContactWriteAt(contactId, Date.now(), nextSequence());
};

// A sender already written after the list request began (a live websocket
// event, a direct upsert) is fresher than the list snapshot: drop it, so
// neither the upsert nor the stamping reverts its newer marker to the list
// request's older start order.
const writableListSenders = <T extends { id: number }>(
  contacts: (T | undefined)[],
  listStartOrder: number | undefined,
): T[] =>
  contacts.filter((contact): contact is T => {
    if (!contact) {
      return false;
    }
    const marker = lastContactWriteById.get(contact.id);
    return !(listStartOrder !== undefined && marker !== undefined && marker.order > listStartOrder);
  });

// Listener-owned upserts record their own markers with the ordering the fence
// needs — a fulfilled snapshot under its request's start order, external data
// under a fresh sequence. The generic upsert matcher must not re-track them.
let isListenerOwnedWrite = false;
const dispatchListenerOwned = <T extends { type: string }>(
  dispatch: (action: T) => unknown,
  action: T,
) => {
  isListenerOwnedWrite = true;
  try {
    return dispatch(action);
  } finally {
    isListenerOwnedWrite = false;
  }
};

contactListenerMiddleware.startListening({
  matcher: isAnyOf(
    conversationActions.fetchConversation.pending,
    conversationActions.fetchConversations.pending,
    notificationActions.fetchNotifications.pending,
  ),
  effect: action => {
    const { requestId } = action.meta as { requestId: string };
    fetchStartOrderByRequestId.set(requestId, nextSequence());
  },
});

contactListenerMiddleware.startListening({
  matcher: isAnyOf(
    conversationActions.fetchConversation.rejected,
    conversationActions.fetchConversations.rejected,
    notificationActions.fetchNotifications.rejected,
  ),
  effect: action => {
    const { requestId } = action.meta as { requestId: string };
    fetchStartOrderByRequestId.delete(requestId);
  },
});

contactListenerMiddleware.startListening({
  matcher: isAnyOf(addContact, addContacts, updateContact),
  effect: action => {
    if (isListenerOwnedWrite) {
      return;
    }
    if (addContacts.match(action)) {
      const { contacts } = action.payload as { contacts: Contact[] };
      contacts.forEach(contact => {
        if (contact) {
          trackContactWrite(contact.id);
        }
      });
      return;
    }
    // e.g. an ActionCable conversation event with no meta.sender dispatches
    // addContact(undefined) — nothing was written, nothing to record.
    const contact = action.payload as Contact | undefined;
    if (contact) {
      trackContactWrite(contact.id);
    }
  },
});

contactListenerMiddleware.startListening({
  matcher: updateContactsPresence.match,
  effect: action => {
    const { contacts } = action.payload as { contacts: Record<number, AvailabilityStatus> };
    // `updateContactsPresence` applies a full snapshot: contacts named in the
    // payload get that value, every other stored contact falls back to
    // offline. Only the latest event is live evidence — an earlier event's
    // per-contact value is superseded even when the newest payload omits the
    // contact — so keep the payload verbatim and let the fulfillment derive
    // what the store would hold now.
    lastPresenceEvent = { at: Date.now(), order: nextSequence(), contacts };
  },
});

contactListenerMiddleware.startListening({
  matcher: isAnyOf(conversationActions.fetchConversations.fulfilled),
  effect: (action, listenerApi) => {
    const { conversations } = action.payload as ConversationListResponse;
    // Mirror the list reducer's per-entry staleness guard: an entry the
    // conversation store rejects as outdated must not reach the contact store
    // either — neither its sender nor a write marker that would fence a
    // fresher detail fetch already in flight.
    const state = listenerApi.getState() as {
      conversations: { entities: Record<number, Conversation | undefined> };
    };
    const contacts = conversations
      .filter(
        conversation =>
          !isOutdatedConversationUpdate(
            state.conversations.entities[conversation.id],
            conversation,
          ),
      )
      .map((conversation: Conversation) => conversation.meta.sender);
    // Consume this request's marker up front — its only remaining use is
    // stamping this fulfillment's writes.
    const { requestId } = action.meta as { requestId: string };
    const listStartOrder = fetchStartOrderByRequestId.get(requestId);
    fetchStartOrderByRequestId.delete(requestId);
    // The senders are snapshots rendered when the LIST request was handled,
    // so stamp their writes with the list request's own start order — not
    // with the completion time. A detail fetch that started later (a
    // conversation opened while pagination was still in flight) resolves
    // unfenced and can apply its fresher contact; one that started earlier
    // is still fenced by the list's fresher senders.
    const writable = writableListSenders(contacts, listStartOrder);
    if (writable.length > 0) {
      dispatchListenerOwned(listenerApi.dispatch, addContacts({ contacts: writable }));
      writable.forEach(contact => {
        trackContactWriteAt(contact.id, Date.now(), listStartOrder ?? nextSequence());
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
    // notification response, a direct upsert from another screen, or a
    // fresher snapshot from an overlapping fetch of the same conversation (a
    // repeat press dispatches a second request while the first is still in
    // flight). Either way the stored copy is newer than this response's data.
    // Writes to other contacts don't matter.
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
    // Derive it from the latest event only, the way the reducer applies it:
    // a contact named in its payload gets that value, an omitted one falls
    // back to offline — the reducer only updates contacts that are already
    // stored, so for a sender that isn't stored yet the event value survives
    // only in the payload kept above.
    let storedAvailability: AvailabilityStatus | undefined;
    if (
      fetchStartOrder !== undefined &&
      lastPresenceEvent !== undefined &&
      lastPresenceEvent.order > fetchStartOrder
    ) {
      storedAvailability = lastPresenceEvent.contacts[contact.id] || 'offline';
    }
    // Neither live presence nor the snapshot supplies a value — omit the
    // property: an explicit `availabilityStatus: undefined` would clear a
    // status the stored contact already holds (e.g. from a presence event
    // just before the fetch) in the upsert merge.
    const { availabilityStatus: snapshotAvailability, ...contactFields } = contact;
    const resolvedAvailability = storedAvailability ?? snapshotAvailability;
    dispatchListenerOwned(
      listenerApi.dispatch,
      addContact(
        resolvedAvailability === undefined
          ? (contactFields as Contact)
          : { ...contactFields, availabilityStatus: resolvedAvailability },
      ),
    );

    // Record the snapshot as a contact write, stamped with this request's own
    // start order: an overlapping fetch that started earlier must not
    // overwrite it when its older response arrives later, while one that
    // started later holds fresher data and must not be fenced by this write.
    trackContactWriteAt(contact.id, Date.now(), fetchStartOrder ?? nextSequence());
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
    // Same as the conversations list: stamp with the request's own start
    // order — a notifications request that started before a detail fetch is
    // the older snapshot, its completion must not fence the fresher one.
    const { requestId } = action.meta as { requestId: string };
    const listStartOrder = fetchStartOrderByRequestId.get(requestId);
    fetchStartOrderByRequestId.delete(requestId);
    const writable = writableListSenders(contacts, listStartOrder);
    if (writable.length > 0) {
      dispatchListenerOwned(listenerApi.dispatch, addContacts({ contacts: writable }));
      writable.forEach(contact => {
        trackContactWriteAt(contact.id, Date.now(), listStartOrder ?? nextSequence());
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
      dispatchListenerOwned(listenerApi.dispatch, addContact(contact));
      trackContactWrite(contact.id);
    }
  },
});
