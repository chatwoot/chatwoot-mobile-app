import { selectConversationParticipantsByConversationId } from '../conversationParticipantSelectors';
import { RootState } from '@/store';
import type { Agent } from '@/types';

const participant = { id: 7, name: 'Devi' } as Agent;

const buildState = (records: { [key: number]: Agent[] }) =>
  ({
    conversationParticipants: { records },
  }) as RootState;

describe('Conversation Participant Selectors', () => {
  it('should select the participants of a conversation', () => {
    const state = buildState({ 250: [participant] });
    expect(selectConversationParticipantsByConversationId(state, 250)).toEqual([participant]);
  });

  it('should return an empty list for a conversation with no participants fetched', () => {
    const state = buildState({ 250: [participant] });
    expect(selectConversationParticipantsByConversationId(state, 999)).toEqual([]);
  });

  it('should return the same reference for repeated misses', () => {
    const state = buildState({});
    const first = selectConversationParticipantsByConversationId(state, 999);
    const second = selectConversationParticipantsByConversationId(state, 888);
    expect(first).toBe(second);
  });
});
