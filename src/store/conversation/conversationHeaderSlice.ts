// Conversation Header Slice is used to manage the header for the conversations screen

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConversationFilterOptions } from '@/types';
import { RootState } from '@/store';

export type CurrentState = 'Search' | 'Filter' | 'Select' | 'none';
export type BottomSheetType = ConversationFilterOptions | 'none';

interface ConversationHeaderState {
  currentState: CurrentState;
  searchTerm: string;
  currentBottomSheet: BottomSheetType;
}

const initialState: ConversationHeaderState = {
  currentState: 'none',
  searchTerm: '',
  currentBottomSheet: 'none',
};

const conversationHeaderSlice = createSlice({
  name: 'conversationHeader',
  initialState,
  reducers: {
    setCurrentState: (state, action: PayloadAction<CurrentState>) => {
      state.currentState = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setBottomSheetState: (state, action: PayloadAction<BottomSheetType>) => {
      state.currentBottomSheet = action.payload;
    },
  },
});

// Selectors
export const selectCurrentState = (state: RootState) => state.conversationHeader.currentState;
export const selectSearchTerm = (state: RootState) => state.conversationHeader.searchTerm;
export const selectBottomSheetState = (state: RootState) =>
  state.conversationHeader.currentBottomSheet;

export const { setCurrentState, setSearchTerm, setBottomSheetState } =
  conversationHeaderSlice.actions;
export default conversationHeaderSlice.reducer;
