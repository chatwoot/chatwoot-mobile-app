import type { RootState } from '@/store';
import { defaultFilterState } from '../conversationFilterSlice';
import { getFilteredConversations } from '../conversationSelectors';
import conversationReducer, { addConversation } from '../conversationSlice';
import { conversation } from './conversationMockData';

describe('conversation selectors', () => {
  it('returns conversations only for the active account', () => {
    const accountTwoConversation = {
      ...conversation,
      id: 251,
      accountId: 2,
    };
    let conversations = conversationReducer(undefined, addConversation(conversation));
    conversations = conversationReducer(conversations, addConversation(accountTwoConversation));
    const state = {
      auth: { user: { account_id: 2 } },
      conversations,
    } as unknown as RootState;

    const result = getFilteredConversations(
      state,
      { ...defaultFilterState, assignee_type: 'all' },
      1,
    );

    expect(result.map(item => item.id)).toEqual([accountTwoConversation.id]);
  });
});
