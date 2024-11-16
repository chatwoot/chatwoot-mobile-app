import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Conversation } from '@/types';

interface SelectedConversationState {
  selectedConversations: {
    [key: number]: Conversation;
  };
  selectedConversation: Conversation | null;
}

const initialState: SelectedConversationState = {
  selectedConversations: {},
  selectedConversation: null,
};

const conversationSelectedSlice = createSlice({
  name: 'conversationSelected',
  initialState,
  reducers: {
    toggleSelection: (state, action: PayloadAction<{ conversation: Conversation }>) => {
      const { conversation } = action.payload;
      const id = conversation.id;

      if (id in state.selectedConversations) {
        const { [id]: removed, ...rest } = state.selectedConversations;
        state.selectedConversations = rest;
      } else {
        state.selectedConversations[id] = conversation;
      }
    },
    clearSelection: state => {
      state.selectedConversations = {};
    },
    selectAll: (state, action: PayloadAction<Conversation[]>) => {
      state.selectedConversations = action.payload.reduce(
        (acc, conversation) => {
          acc[conversation.id] = conversation;
          return acc;
        },
        {} as { [key: number]: Conversation },
      );
    },
    selectSingleConversation: (state, action: PayloadAction<Conversation>) => {
      state.selectedConversation = action.payload;
    },
  },
});

export const selectSelected = (state: RootState) =>
  state.selectedConversation.selectedConversations;

export const selectSelectedConversation = (state: RootState) =>
  state.selectedConversation.selectedConversation;

export const selectSelectedIds = createSelector([selectSelected], selected =>
  Object.keys(selected).map(Number),
);

export const selectSelectedConversations = createSelector([selectSelected], selected =>
  Object.values(selected),
);

export const selectIsConversationSelected = createSelector(
  [selectSelected, (_state: RootState, conversationId: number) => conversationId],
  (selected, conversationId) => conversationId in selected,
);

export const selectSelectedInboxes = createSelector([selectSelectedConversations], selected => [
  ...new Set(selected.map(conversation => conversation.inboxId)),
]);

export const { toggleSelection, clearSelection, selectAll, selectSingleConversation } =
  conversationSelectedSlice.actions;
export default conversationSelectedSlice.reducer;
