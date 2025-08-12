// Conversation Filter Slice is used to manage the filters for the conversations screen

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConversationFilterOptions } from '@/types';
import { RootState } from '@/store';

export type FilterState = Record<ConversationFilterOptions, string>;

export const defaultFilterState: FilterState = {
  assignee_type: 'all',
  status: 'open',
  sort_by: 'latest',
  inbox_id: '0',
};

interface ConversationFilterState {
  filters: FilterState;
}

const initialState: ConversationFilterState = {
  filters: defaultFilterState,
};

const conversationFilterSlice = createSlice({
  name: 'conversationFilter',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<{ key: ConversationFilterOptions; value: string }>,
    ) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    resetFilters: state => {
      state.filters = defaultFilterState;
    },
  },
});

export const { setFilters, resetFilters } = conversationFilterSlice.actions;

export const selectFilters = (state: RootState) => state.conversationFilter.filters;

export default conversationFilterSlice.reducer;
