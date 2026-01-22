import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export type SortTypes = 'asc' | 'desc';

export type FilterState = {
  sortOrder: SortTypes;
  search_text: string; // Adicionado search_text
};

export const defaultFilterState: FilterState = {
  sortOrder: 'desc',
  search_text: '', // Adicionado search_text
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
      state.search_text = defaultFilterState.search_text; // Garantir que o search_text também seja resetado
    },
    setSearchText: (state, action: PayloadAction<string>) => { // Novo reducer
      state.search_text = action.payload;
    },
  },
});

export const { setFilters, resetFilters, setSearchText } = notificationFilterSlice.actions; // Exportar setSearchText

export const selectSortOrder = (state: RootState) => state.notificationFilter.sortOrder;
export const selectSearchText = (state: RootState) => state.notificationFilter.search_text; // Novo seletor para search_text
export const selectFilters = (state: RootState) => state.notificationFilter; // Novo seletor para FilterState completo

export default notificationFilterSlice.reducer;