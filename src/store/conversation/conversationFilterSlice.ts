// Conversation Filter Slice is used to manage the filters for the conversations screen

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConversationFilterOptions } from '@/types';
import { RootState } from '@/store';

export type FilterState = Record<ConversationFilterOptions, string>;

export const defaultFilterState: FilterState = {
  assignee_type: 'me',
  status: 'open',
  read_status: 'all',
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

// Filters persisted before a filter key existed lack that key, so the defaults
// fill the gaps.
export const selectFilters = createSelector(
  (state: RootState) => state.conversationFilter.filters,
  (filters): FilterState => ({ ...defaultFilterState, ...filters }),
);

export default conversationFilterSlice.reducer;
