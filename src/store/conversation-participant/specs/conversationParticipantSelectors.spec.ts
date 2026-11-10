import {
  selectConversationParticipantsByConversationId,
  isConversationParticipantsFetching,
} from '../conversationParticipantSelectors';
import { RootState } from '@/store';
import type { Agent } from '@/types';

const participant = { id: 7, name: 'Devi' } as Agent;

const buildState = (records: { [key: number]: Agent[] }, loading = false) =>
  ({
    conversationParticipants: { records, uiFlags: { loading, updating: false } },
  }) as RootState;

describe('Conversation Participant Selectors', () => {
  it('should select the participants of a conversation', () => {
    const state = buildState({ 250: [participant] });
    expect(selectConversationParticipantsByConversationId(state, 250)).toEqual([participant]);
  });

  it('should return an empty list for a conversation fetched with no participants', () => {
    const state = buildState({ 250: [] });
    expect(selectConversationParticipantsByConversationId(state, 250)).toEqual([]);
  });

  // A conversation whose fetch has not resolved must stay distinguishable from
  // one with no participants, since an update replaces the whole set.
  it('should return undefined for a conversation that has not been fetched', () => {
    const state = buildState({ 250: [participant] });
    expect(selectConversationParticipantsByConversationId(state, 999)).toBeUndefined();
  });

  it('should report whether participants are being fetched', () => {
    expect(isConversationParticipantsFetching(buildState({}, true))).toBe(true);
    expect(isConversationParticipantsFetching(buildState({}, false))).toBe(false);
  });
});
