import * as Sentry from '@sentry/react-native';

import { repairPersistedConversations } from '../conversationPersistUtils';

jest.mock('@sentry/react-native', () => ({
  captureMessage: jest.fn(),
}));

describe('repairPersistedConversations', () => {
  const stateWith = (ids: unknown[], entities: Record<string, unknown>) => ({
    conversations: { ids, entities, isLoadingConversations: false },
    auth: { user: 1 },
  });

  beforeEach(() => jest.clearAllMocks());

  it('drops ids that have no stored conversation', () => {
    const state = stateWith([1, null, 2, 3], { 1: { id: 1 }, 2: { id: 2 } });

    expect(repairPersistedConversations(state).conversations).toEqual({
      ids: [1, 2],
      entities: { 1: { id: 1 }, 2: { id: 2 } },
      isLoadingConversations: false,
    });
  });

  it('reports how many ids were dropped and their types', () => {
    repairPersistedConversations(stateWith([1, null, 3], { 1: { id: 1 } }));

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Persisted conversation ids without a conversation',
      { extra: { ids: 3, missing: 2, missingIdTypes: ['null', 'number'] } },
    );
  });

  it('leaves the rest of the persisted state untouched', () => {
    const state = stateWith([1, 2], { 1: { id: 1 } });

    expect(repairPersistedConversations(state).auth).toBe(state.auth);
  });

  it('returns the same state when every id has a conversation', () => {
    const state = stateWith([1, 2], { 1: { id: 1 }, 2: { id: 2 } });

    expect(repairPersistedConversations(state)).toBe(state);
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('returns the same state when no conversations were persisted', () => {
    const state = { conversations: undefined, auth: { user: 1 } };

    expect(repairPersistedConversations(state)).toBe(state);
  });
});
