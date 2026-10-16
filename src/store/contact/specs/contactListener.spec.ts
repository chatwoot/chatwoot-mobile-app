import { configureStore } from '@reduxjs/toolkit';

import { contactListenerMiddleware, MAX_TRACKED_CONTACT_WRITES } from '../contactListener';
import contactReducer, { addContact, updateContact, updateContactsPresence } from '../contactSlice';
import { addNotification } from '@/store/notification/notificationSlice';
import conversationReducer from '@/store/conversation/conversationSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { conversation as conversationFixture } from '@/store/conversation/specs/conversationMockData';
import type { Notification } from '@/types/Notification';
import type { Conversation, Contact } from '@/types';

const makeConversation = ({
  id,
  updatedAt,
  sender,
}: {
  id: number;
  updatedAt: number;
  sender: Contact;
}): Conversation => ({
  ...conversationFixture,
  id,
  updatedAt,
  meta: { ...conversationFixture.meta, sender },
});

const makeSender = ({ id, ...overrides }: Partial<Contact> & { id: number }): Contact =>
  ({
    ...conversationFixture.meta.sender,
    id,
    ...overrides,
  }) as Contact;

const START = 1_000_000;

// The listener keeps module-level ordering markers; giving every test its own
// time window keeps markers from earlier tests from fencing the current one.
let testWindowStart = START;

const makeStore = () =>
  configureStore({
    reducer: {
      conversations: conversationReducer,
      contacts: contactReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().prepend(contactListenerMiddleware.middleware),
  });

const fetchStarted = (store: ReturnType<typeof makeStore>, conversation: Conversation) =>
  store.dispatch(
    conversationActions.fetchConversation.pending(`req-${conversation.id}`, conversation.id),
  );

const fetchResolved = (store: ReturnType<typeof makeStore>, conversation: Conversation) =>
  store.dispatch(
    conversationActions.fetchConversation.fulfilled(
      { conversation },
      `req-${conversation.id}`,
      conversation.id,
    ),
  );

const listResolved = (store: ReturnType<typeof makeStore>, conversations: Conversation[]) =>
  store.dispatch(
    conversationActions.fetchConversations.fulfilled(
      { conversations, meta: { mineCount: 1, unassignedCount: 1, allCount: 1 } },
      `req-list-${conversations[0]?.id}`,
      { page: 1, status: 'open', assigneeType: 'me', sortBy: 'latest' },
    ),
  );

describe('contactListener', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(testWindowStart);
    testWindowStart += 1_000_000;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds the sender from a fulfilled conversation fetch', () => {
    const store = makeStore();
    const sender = makeSender({ id: 1, customAttributes: { plan: 'gold' } });

    fetchStarted(store, makeConversation({ id: 11, updatedAt: 100, sender }));
    fetchResolved(store, makeConversation({ id: 11, updatedAt: 100, sender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('does nothing when the response has no sender', () => {
    const store = makeStore();
    const noSenderConversation: Conversation = {
      ...conversationFixture,
      id: 12,
      updatedAt: 100,
      meta: { ...conversationFixture.meta, sender: undefined } as unknown as Conversation['meta'],
    };

    fetchStarted(store, noSenderConversation);
    fetchResolved(store, noSenderConversation);

    expect(store.getState().contacts.ids).toEqual([]);
  });

  it('skips a response that is older than the stored conversation', () => {
    const store = makeStore();
    const freshSender = makeSender({ id: 1, customAttributes: { plan: 'gold' } });
    const staleSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    fetchStarted(store, makeConversation({ id: 13, updatedAt: 200, sender: freshSender }));
    fetchResolved(store, makeConversation({ id: 13, updatedAt: 200, sender: freshSender }));
    fetchResolved(store, makeConversation({ id: 13, updatedAt: 100, sender: staleSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('skips the snapshot when the same contact was written during the fetch', () => {
    const store = makeStore();
    const staleSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    fetchStarted(store, makeConversation({ id: 14, updatedAt: 100, sender: staleSender }));

    jest.advanceTimersByTime(10);
    store.dispatch(updateContact(makeSender({ id: 1, customAttributes: { plan: 'gold' } })));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 14, updatedAt: 100, sender: staleSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('applies the snapshot when an unrelated contact was written during the fetch', () => {
    const store = makeStore();
    const sender = makeSender({ id: 1, customAttributes: { plan: 'gold' } });

    fetchStarted(store, makeConversation({ id: 15, updatedAt: 100, sender }));

    jest.advanceTimersByTime(10);
    store.dispatch(updateContact(makeSender({ id: 2, customAttributes: { other: 'write' } })));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 15, updatedAt: 100, sender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
    expect(store.getState().contacts.entities[2]?.customAttributes).toEqual({ other: 'write' });
  });

  it('keeps each request fenced when fetches overlap', () => {
    const store = makeStore();
    const senderOne = makeSender({ id: 1, customAttributes: { plan: 'gold' } });
    const staleSenderOne = makeSender({ id: 1, customAttributes: { plan: 'silver' } });
    const senderTwo = makeSender({ id: 2 });

    // Conversation 1 starts loading, its contact is then updated over the
    // websocket, and a second fetch starts before the first one resolves.
    fetchStarted(store, makeConversation({ id: 16, updatedAt: 100, sender: staleSenderOne }));

    jest.advanceTimersByTime(10);
    store.dispatch(updateContact(senderOne));

    jest.advanceTimersByTime(10);
    fetchStarted(store, makeConversation({ id: 17, updatedAt: 100, sender: senderTwo }));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 16, updatedAt: 100, sender: staleSenderOne }));
    fetchResolved(store, makeConversation({ id: 17, updatedAt: 100, sender: senderTwo }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
    expect(store.getState().contacts.entities[2]).toBeDefined();
  });

  it('keeps the stored availability status when presence was updated during the fetch', () => {
    const store = makeStore();
    const onlineContact = makeSender({ id: 1, availabilityStatus: 'online' });
    store.dispatch(addContact(onlineContact));

    const snapshot = makeSender({ id: 1, availabilityStatus: 'offline', name: 'Renamed' });
    fetchStarted(store, makeConversation({ id: 18, updatedAt: 100, sender: snapshot }));

    jest.advanceTimersByTime(10);
    store.dispatch(updateContactsPresence({ contacts: { 1: 'online' } }));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 18, updatedAt: 100, sender: snapshot }));

    const stored = store.getState().contacts.entities[1];
    expect(stored?.availabilityStatus).toEqual('online');
    expect(stored?.name).toEqual('Renamed');
  });

  it('takes the snapshot availability status when the stored one predates the fetch', () => {
    const store = makeStore();
    // e.g. rehydrated from storage after a relaunch with the socket down: the
    // stored status has no live write behind it, the snapshot does.
    store.dispatch(addContact(makeSender({ id: 1, availabilityStatus: 'online' })));

    const snapshot = makeSender({ id: 1, availabilityStatus: 'offline', name: 'Renamed' });
    fetchStarted(store, makeConversation({ id: 18, updatedAt: 100, sender: snapshot }));
    fetchResolved(store, makeConversation({ id: 18, updatedAt: 100, sender: snapshot }));

    const stored = store.getState().contacts.entities[1];
    expect(stored?.availabilityStatus).toEqual('offline');
    expect(stored?.name).toEqual('Renamed');
  });

  it('uses the snapshot availability status when the contact is not in the store yet', () => {
    const store = makeStore();
    const snapshot = makeSender({ id: 1, availabilityStatus: 'online' });

    fetchStarted(store, makeConversation({ id: 19, updatedAt: 100, sender: snapshot }));
    fetchResolved(store, makeConversation({ id: 19, updatedAt: 100, sender: snapshot }));

    expect(store.getState().contacts.entities[1]?.availabilityStatus).toEqual('online');
  });

  it('evicts the oldest tracked write when the map reaches the cap', () => {
    const store = makeStore();
    const staleSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    fetchStarted(store, makeConversation({ id: 20, updatedAt: 100, sender: staleSender }));

    jest.advanceTimersByTime(10);
    store.dispatch(updateContact(makeSender({ id: 1, customAttributes: { plan: 'gold' } })));
    for (let id = 2; id <= MAX_TRACKED_CONTACT_WRITES; id += 1) {
      store.dispatch(updateContact(makeSender({ id, customAttributes: { filler: String(id) } })));
    }
    // One more distinct contact over the cap while nothing has expired: the
    // oldest marker — contact 1's — is dropped to keep the map bounded, so
    // the snapshot for contact 1 is no longer fenced.
    store.dispatch(updateContact(makeSender({ id: MAX_TRACKED_CONTACT_WRITES + 1 })));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 20, updatedAt: 100, sender: staleSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'silver' });
    expect(store.getState().contacts.entities[MAX_TRACKED_CONTACT_WRITES + 1]).toBeDefined();
  });

  it('skips the snapshot when a conversations-list write landed during the fetch', () => {
    const store = makeStore();
    const listSender = makeSender({ id: 1, customAttributes: { plan: 'gold' } });
    const snapshotSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    fetchStarted(store, makeConversation({ id: 21, updatedAt: 100, sender: snapshotSender }));

    jest.advanceTimersByTime(10);
    // The conversation updatedAt is unchanged, so the conversation staleness
    // guard passes — only the list write's fence rejects the snapshot.
    listResolved(store, [makeConversation({ id: 21, updatedAt: 100, sender: listSender })]);

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 21, updatedAt: 100, sender: snapshotSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('applies the snapshot when the list write predates the fetch', () => {
    const store = makeStore();
    const sender = makeSender({ id: 1, customAttributes: { plan: 'gold' } });

    listResolved(store, [makeConversation({ id: 24, updatedAt: 100, sender })]);

    jest.advanceTimersByTime(10);
    fetchStarted(store, makeConversation({ id: 24, updatedAt: 100, sender }));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 24, updatedAt: 100, sender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('skips the snapshot when a notification stored the contact during the fetch', () => {
    const store = makeStore();
    const snapshotSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    fetchStarted(store, makeConversation({ id: 25, updatedAt: 100, sender: snapshotSender }));

    jest.advanceTimersByTime(10);
    store.dispatch(
      addNotification({
        accountId: 1,
        unreadCount: 1,
        count: 1,
        notification: {
          id: 991,
          primaryActorType: 'Conversation',
          primaryActor: {
            meta: { sender: makeSender({ id: 1, customAttributes: { plan: 'gold' } }) },
          },
        } as unknown as Notification,
      }),
    );

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 25, updatedAt: 100, sender: snapshotSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('keeps the oldest marker when a tracked write is refreshed at the cap', () => {
    const store = makeStore();
    const staleSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    fetchStarted(store, makeConversation({ id: 23, updatedAt: 100, sender: staleSender }));

    jest.advanceTimersByTime(10);
    // Contact 1 is written during the fetch and must stay fenced. The map is
    // then filled to the cap, and refreshing an already-tracked contact must
    // not evict contact 1's marker to make room.
    store.dispatch(updateContact(makeSender({ id: 1, customAttributes: { plan: 'gold' } })));
    for (let id = 2; id <= MAX_TRACKED_CONTACT_WRITES; id += 1) {
      store.dispatch(updateContact(makeSender({ id, customAttributes: { filler: String(id) } })));
    }
    store.dispatch(updateContact(makeSender({ id: 2, customAttributes: { filler: 'again' } })));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 23, updatedAt: 100, sender: staleSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('vetoes the snapshot when a write lands in the same tick as the fetch start', () => {
    const store = makeStore();
    const staleSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    fetchStarted(store, makeConversation({ id: 26, updatedAt: 100, sender: staleSender }));
    // No timer advance: the websocket write is processed in the same
    // millisecond as the fetch start, where wallclock values would tie —
    // ordering must come from the processing sequence instead.
    store.dispatch(updateContact(makeSender({ id: 1, customAttributes: { plan: 'gold' } })));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 26, updatedAt: 100, sender: staleSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('keeps the fresher snapshot when an overlapping fetch of the same conversation resolves late', () => {
    const store = makeStore();
    const earlierSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });
    const laterSender = makeSender({ id: 1, customAttributes: { plan: 'gold' } });

    // Pressing a notification dispatches one fetch and pushes the chat
    // screen, which dispatches another for the same conversation while the
    // first is still in flight. The later request resolves first; the
    // earlier one must not overwrite its contact when it finally resolves.
    store.dispatch(conversationActions.fetchConversation.pending('req-press-30', 30));

    jest.advanceTimersByTime(10);
    store.dispatch(conversationActions.fetchConversation.pending('req-screen-30', 30));

    jest.advanceTimersByTime(10);
    store.dispatch(
      conversationActions.fetchConversation.fulfilled(
        { conversation: makeConversation({ id: 30, updatedAt: 100, sender: laterSender }) },
        'req-screen-30',
        30,
      ),
    );

    jest.advanceTimersByTime(10);
    store.dispatch(
      conversationActions.fetchConversation.fulfilled(
        { conversation: makeConversation({ id: 30, updatedAt: 100, sender: earlierSender }) },
        'req-press-30',
        30,
      ),
    );

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('keeps a presence event for a contact that is not in the store yet', () => {
    const store = makeStore();
    const snapshot = makeSender({ id: 1, availabilityStatus: 'offline', name: 'New contact' });

    fetchStarted(store, makeConversation({ id: 27, updatedAt: 100, sender: snapshot }));

    jest.advanceTimersByTime(10);
    // The contact isn't stored yet, so updateContactsPresence's reducer
    // skips it — the event's value survives only in the listener's own
    // per-contact tracking.
    store.dispatch(updateContactsPresence({ contacts: { 1: 'online' } }));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 27, updatedAt: 100, sender: snapshot }));

    const stored = store.getState().contacts.entities[1];
    expect(stored?.availabilityStatus).toEqual('online');
    expect(stored?.name).toEqual('New contact');
  });

  it("uses the snapshot availability when the contact's own presence event predates the fetch", () => {
    const store = makeStore();

    // Contact 1's last presence event lands before the fetch; only another
    // contact's event lands during it.
    store.dispatch(updateContactsPresence({ contacts: { 1: 'online' } }));

    const snapshot = makeSender({ id: 1, availabilityStatus: 'offline', name: 'Renamed' });
    fetchStarted(store, makeConversation({ id: 28, updatedAt: 100, sender: snapshot }));

    jest.advanceTimersByTime(10);
    store.dispatch(updateContactsPresence({ contacts: { 2: 'busy' } }));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 28, updatedAt: 100, sender: snapshot }));

    const stored = store.getState().contacts.entities[1];
    expect(stored?.availabilityStatus).toEqual('offline');
    expect(stored?.name).toEqual('Renamed');
  });

  it('lets a later-started fetch supersede an earlier completion of the same conversation', () => {
    const store = makeStore();
    const earlierSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });
    const laterSender = makeSender({ id: 1, customAttributes: { plan: 'gold' } });

    // The normal ordering for repeated presses: the earlier request resolves
    // first, the one that started later carries the fresher snapshot and must
    // not be fenced by the earlier completion's write.
    store.dispatch(conversationActions.fetchConversation.pending('req-press-31', 31));

    jest.advanceTimersByTime(10);
    store.dispatch(conversationActions.fetchConversation.pending('req-screen-31', 31));

    jest.advanceTimersByTime(10);
    store.dispatch(
      conversationActions.fetchConversation.fulfilled(
        { conversation: makeConversation({ id: 31, updatedAt: 100, sender: earlierSender }) },
        'req-press-31',
        31,
      ),
    );

    jest.advanceTimersByTime(10);
    store.dispatch(
      conversationActions.fetchConversation.fulfilled(
        { conversation: makeConversation({ id: 31, updatedAt: 100, sender: laterSender }) },
        'req-screen-31',
        31,
      ),
    );

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('keeps the stored contact offline when a newer presence event omits it', () => {
    const store = makeStore();
    store.dispatch(addContact(makeSender({ id: 1, availabilityStatus: 'online' })));

    const snapshot = makeSender({ id: 1, availabilityStatus: 'offline', name: 'Renamed' });
    fetchStarted(store, makeConversation({ id: 32, updatedAt: 100, sender: snapshot }));

    jest.advanceTimersByTime(10);
    store.dispatch(updateContactsPresence({ contacts: { 1: 'online' } }));
    // A later full snapshot without contact 1 already applied the reducer's
    // offline fallback to the stored contact; the earlier explicit marker
    // must not revive it at fulfillment.
    store.dispatch(updateContactsPresence({ contacts: { 2: 'busy' } }));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 32, updatedAt: 100, sender: snapshot }));

    const stored = store.getState().contacts.entities[1];
    expect(stored?.availabilityStatus).toEqual('offline');
    expect(stored?.name).toEqual('Renamed');
  });

  it('skips the snapshot when a direct upsert stored the contact during the fetch', () => {
    const store = makeStore();
    const snapshotSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    fetchStarted(store, makeConversation({ id: 33, updatedAt: 100, sender: snapshotSender }));

    jest.advanceTimersByTime(10);
    // e.g. the contact-details screen fetched the full record from search
    // while the conversation fetch was still in flight.
    store.dispatch(addContact(makeSender({ id: 1, customAttributes: { plan: 'gold' } })));

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 33, updatedAt: 100, sender: snapshotSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });

  it('ignores senders from list entries the conversation store rejects as outdated', () => {
    const store = makeStore();
    const freshSender = makeSender({ id: 1, customAttributes: { plan: 'gold' } });
    const staleListSender = makeSender({ id: 1, customAttributes: { plan: 'silver' } });

    // A fresh snapshot is stored for conversation 34, then a detail fetch
    // starts and an outdated list response lands while it is in flight: its
    // sender must not be stored, and must not fence the in-flight request
    // that carries the fresh contact.
    fetchStarted(store, makeConversation({ id: 34, updatedAt: 200, sender: freshSender }));
    fetchResolved(store, makeConversation({ id: 34, updatedAt: 200, sender: freshSender }));

    jest.advanceTimersByTime(10);
    fetchStarted(store, makeConversation({ id: 34, updatedAt: 200, sender: freshSender }));

    jest.advanceTimersByTime(10);
    listResolved(store, [makeConversation({ id: 34, updatedAt: 100, sender: staleListSender })]);

    jest.advanceTimersByTime(10);
    fetchResolved(store, makeConversation({ id: 34, updatedAt: 200, sender: freshSender }));

    expect(store.getState().contacts.entities[1]?.customAttributes).toEqual({ plan: 'gold' });
  });
});
