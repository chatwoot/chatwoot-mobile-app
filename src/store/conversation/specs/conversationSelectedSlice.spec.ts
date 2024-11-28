import { RootState } from '@/store';
import reducer, {
  toggleSelection,
  clearSelection,
  selectAll,
  selectSingleConversation,
  selectSelected,
  selectSelectedConversation,
  selectSelectedIds,
  selectSelectedConversations,
  selectIsConversationSelected,
} from '../conversationSelectedSlice';
import { Conversation } from '@/types';
import { conversation } from './conversationMockData';

describe('conversationSelected reducer', () => {
  const initialState = {
    selectedConversations: {},
    selectedConversation: null,
  };

  const mockConversation: Conversation = {
    ...conversation,
  };

  const mockConversation2: Conversation = {
    ...conversation,
    id: 251,
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('toggleSelection', () => {
    it('should add conversation to selection when not selected', () => {
      const actual = reducer(initialState, toggleSelection({ conversation: mockConversation }));
      expect(actual.selectedConversations[mockConversation.id]).toEqual(mockConversation);
    });

    it('should remove conversation from selection when already selected', () => {
      const stateWithSelection = {
        ...initialState,
        selectedConversations: { [mockConversation.id]: mockConversation },
      };
      const actual = reducer(
        stateWithSelection,
        toggleSelection({ conversation: mockConversation }),
      );
      expect(actual.selectedConversations[mockConversation.id]).toBeUndefined();
    });
  });

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      const stateWithSelections = {
        selectedConversations: { [mockConversation.id]: mockConversation },
        selectedConversation: mockConversation,
      };
      const actual = reducer(stateWithSelections, clearSelection());
      expect(actual).toEqual(initialState);
    });
  });

  describe('selectAll', () => {
    it('should select all provided conversations', () => {
      const conversations = [mockConversation, mockConversation2];
      const actual = reducer(initialState, selectAll(conversations));
      expect(actual.selectedConversations).toEqual({
        [mockConversation.id]: mockConversation,
        [mockConversation2.id]: mockConversation2,
      });
    });
  });

  describe('selectSingleConversation', () => {
    it('should set the selected conversation', () => {
      const actual = reducer(initialState, selectSingleConversation(mockConversation));
      expect(actual.selectedConversation).toEqual(mockConversation);
    });
  });

  describe('selectors', () => {
    const mockState = {
      selectedConversation: {
        selectedConversations: {
          [mockConversation.id]: mockConversation,
          [mockConversation2.id]: mockConversation2,
        },
        selectedConversation: mockConversation,
      },
    } as RootState;

    it('selectSelected should return selected conversations object', () => {
      const selected = selectSelected(mockState);
      expect(selected).toEqual(mockState.selectedConversation.selectedConversations);
    });

    it('selectSelectedConversation should return single selected conversation', () => {
      const selected = selectSelectedConversation(mockState);
      expect(selected).toEqual(mockConversation);
    });

    it('selectSelectedIds should return array of selected conversation ids', () => {
      const ids = selectSelectedIds(mockState);
      expect(ids).toEqual([mockConversation.id, mockConversation2.id]);
    });

    it('selectSelectedConversations should return array of selected conversations', () => {
      const conversations = selectSelectedConversations(mockState);
      expect(conversations).toEqual([mockConversation, mockConversation2]);
    });

    it('selectIsConversationSelected should return true if conversation is selected', () => {
      const isSelected = selectIsConversationSelected(mockState, mockConversation.id);
      expect(isSelected).toBe(true);
    });
  });
});
