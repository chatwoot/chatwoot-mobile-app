import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { Label } from '@/types';
import { labelActions } from './labelActions';

export const labelAdapter = createEntityAdapter<Label>();

export interface LabelState {
  isLoading: boolean;
}

const initialState = labelAdapter.getInitialState<LabelState>({
  isLoading: false,
});

const labelSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(labelActions.fetchLabels.pending, state => {
        state.isLoading = true;
      })
      .addCase(labelActions.fetchLabels.fulfilled, (state, action) => {
        const { payload: labels } = action.payload;
        labelAdapter.setAll(state, labels);
        state.isLoading = false;
      })
      .addCase(labelActions.fetchLabels.rejected, (state, { error }) => {
        state.isLoading = false;
      });
  },
});

export default labelSlice.reducer;
