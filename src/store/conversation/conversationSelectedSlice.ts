import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Conversation } from '@/types';

interface SelectedConversationState {
  selectedIds: number[];
}

const initialState: SelectedConversationState = {
  selectedIds: [],
};

const conversationSelectedSlice = createSlice({
  name: 'conversationSelected',
  initialState,
  reducers: {
    toggleSelection: (state, action: PayloadAction<{ id: number; index: number }>) => {
      const { id } = action.payload;
      const exists = state.selectedIds.includes(id);

      if (exists) {
        state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    clearSelection: state => {
      state.selectedIds = [];
    },
    selectAll: (state, action: PayloadAction<Conversation[]>) => {
      state.selectedIds = action.payload.map(conversation => conversation.id);
    },
  },
});

export const selectSelectedIds = (state: RootState) => state.selectedConversation.selectedIds;

export const { toggleSelection, clearSelection, selectAll } = conversationSelectedSlice.actions;
export default conversationSelectedSlice.reducer;
