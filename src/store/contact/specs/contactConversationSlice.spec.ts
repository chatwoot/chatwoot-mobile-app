import reducer, {
  selectContactConversationsByContactId,
  selectHasLoadedContactConversations,
} from '../contactConversationSlice';
import { contactConversationActions } from '../contactConversationActions';
import type { RootState } from '@/store';
import type { Conversation } from '@/types';

const { getContactConversations } = contactConversationActions;

const conversation = (id: number) => ({ id }) as Conversation;
const rootState = (records: Record<number, Conversation[]>) =>
  ({ contactConversations: { records } }) as unknown as RootState;

describe('contactConversation reducer', () => {
  it('stores the fetched conversations for the contact', () => {
    const state = reducer(
      undefined,
      getContactConversations.fulfilled(
        { contactId: 7, conversations: [conversation(1), conversation(2)] },
        'request',
        { contactId: 7 },
      ),
    );
    expect(state.records[7]).toEqual([conversation(1), conversation(2)]);
  });

  it('marks a contact as loaded with no conversations when its first fetch fails', () => {
    const state = reducer(
      undefined,
      getContactConversations.rejected(null, 'request', { contactId: 7 }, 'offline'),
    );
    expect(state.records[7]).toEqual([]);
  });

  it('keeps the cached conversations when a later fetch fails', () => {
    const state = reducer(
      { records: { 7: [conversation(1)] } },
      getContactConversations.rejected(null, 'request', { contactId: 7 }, 'offline'),
    );
    expect(state.records[7]).toEqual([conversation(1)]);
  });
});

describe('contactConversation selectors', () => {
  it('reports an unfetched contact as not loaded with no conversations', () => {
    const state = rootState({});
    expect(selectHasLoadedContactConversations(7)(state)).toBe(false);
    expect(selectContactConversationsByContactId(7)(state)).toEqual([]);
  });

  it('reports a fetched contact as loaded, even with no conversations', () => {
    const state = rootState({ 7: [] });
    expect(selectHasLoadedContactConversations(7)(state)).toBe(true);
  });
});
