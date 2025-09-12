import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { macroActions } from './macroActions';
import { Macro } from '@/types';

export const macroAdapter = createEntityAdapter<Macro>();

export interface MacroState {
  isLoading: boolean;
}

const initialState = macroAdapter.getInitialState<MacroState>({
  isLoading: false,
});

export const macroSlice = createSlice({
  name: 'macro',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(macroActions.fetchMacros.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(macroActions.fetchMacros.fulfilled, (state, action) => {
      const { payload: macros } = action.payload;
      macroAdapter.setAll(state, macros);
      state.isLoading = false;
    });
    builder.addCase(macroActions.fetchMacros.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});

export default macroSlice.reducer;
