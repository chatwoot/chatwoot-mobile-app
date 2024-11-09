import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { conversationListData } from '@/mockdata/conversationListMockdata';
import { RootState } from '@/store';

interface SelectedConversationState {
  selectedIndexes: number[];
}

const initialState: SelectedConversationState = {
  selectedIndexes: [],
};

const conversationSelectedSlice = createSlice({
  name: 'conversationSelected',
  initialState,
  reducers: {
    toggleSelection: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const exists = state.selectedIndexes.includes(index);

      if (exists) {
        state.selectedIndexes = state.selectedIndexes.filter(i => i !== index);
      } else {
        state.selectedIndexes.push(index);
      }
    },
    clearSelection: state => {
      state.selectedIndexes = [];
    },
    selectAll: (state, action: PayloadAction<typeof conversationListData>) => {
      state.selectedIndexes = action.payload.map((_, index) => index);
    },
  },
});

export const selectSelectedIndexes = (state: RootState) =>
  state.selectedConversation.selectedIndexes;

export const { toggleSelection, clearSelection, selectAll } = conversationSelectedSlice.actions;
export default conversationSelectedSlice.reducer;
