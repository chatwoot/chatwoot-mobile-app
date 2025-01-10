import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export type SortTypes = 'asc' | 'desc';

export type FilterState = {
  sortOrder: SortTypes;
};

export const defaultFilterState: FilterState = {
  sortOrder: 'desc',
};

const notificationFilterSlice = createSlice({
  name: 'notificationFilter',
  initialState: defaultFilterState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ key: SortTypes }>) => {
      state.sortOrder = action.payload.key;
    },
    resetFilters: state => {
      state.sortOrder = defaultFilterState.sortOrder;
    },
  },
});

export const { setFilters, resetFilters } = notificationFilterSlice.actions;

export const selectSortOrder = (state: RootState) => state.notificationFilter.sortOrder;

export default notificationFilterSlice.reducer;
