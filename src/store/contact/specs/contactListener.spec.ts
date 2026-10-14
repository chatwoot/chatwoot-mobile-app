import { configureStore } from '@reduxjs/toolkit';

import { contactListenerMiddleware } from '../contactListener';
import contactReducer, { addContact, updateContact } from '../contactSlice';
import conversationReducer from '@/store/conversation/conversationSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { conversation as conversationFixture } from '@/store/conversation/specs/conversationMockData';
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

  it('keeps the stored availability status instead of the render-time one', () => {
    const store = makeStore();
    const onlineContact = makeSender({ id: 1, availabilityStatus: 'online' });
    store.dispatch(addContact(onlineContact));

    const snapshot = makeSender({ id: 1, availabilityStatus: 'offline', name: 'Renamed' });
    fetchStarted(store, makeConversation({ id: 18, updatedAt: 100, sender: snapshot }));
    fetchResolved(store, makeConversation({ id: 18, updatedAt: 100, sender: snapshot }));

    const stored = store.getState().contacts.entities[1];
    expect(stored?.availabilityStatus).toEqual('online');
    expect(stored?.name).toEqual('Renamed');
  });

  it('uses the snapshot availability status when the contact is not in the store yet', () => {
    const store = makeStore();
    const snapshot = makeSender({ id: 1, availabilityStatus: 'online' });

    fetchStarted(store, makeConversation({ id: 19, updatedAt: 100, sender: snapshot }));
    fetchResolved(store, makeConversation({ id: 19, updatedAt: 100, sender: snapshot }));

    expect(store.getState().contacts.entities[1]?.availabilityStatus).toEqual('online');
  });
});
