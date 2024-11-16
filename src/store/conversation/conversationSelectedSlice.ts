import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Conversation } from '@/types';

interface SelectedConversationState {
  selected: {
    [key: number]: Conversation;
  };
}

const initialState: SelectedConversationState = {
  selected: {},
};

const conversationSelectedSlice = createSlice({
  name: 'conversationSelected',
  initialState,
  reducers: {
    toggleSelection: (state, action: PayloadAction<{ conversation: Conversation }>) => {
      const { conversation } = action.payload;
      const id = conversation.id;

      if (id in state.selected) {
        const { [id]: removed, ...rest } = state.selected;
        state.selected = rest;
      } else {
        state.selected[id] = conversation;
      }
    },
    clearSelection: state => {
      state.selected = {};
    },
    selectAll: (state, action: PayloadAction<Conversation[]>) => {
      state.selected = action.payload.reduce(
        (acc, conversation) => {
          acc[conversation.id] = conversation;
          return acc;
        },
        {} as { [key: number]: Conversation },
      );
    },
  },
});

export const selectSelected = (state: RootState) => state.selectedConversation.selected;

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

export const { toggleSelection, clearSelection, selectAll } = conversationSelectedSlice.actions;
export default conversationSelectedSlice.reducer;
