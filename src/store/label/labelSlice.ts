import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { Label } from '@/types';
import { labelActions } from './labelActions';

export const labelAdapter = createEntityAdapter<Label>({
  selectId: label => label.id,
});

export interface LabelState {
  uiFlags: {
    isLoading: boolean;
  };
}

const initialState = labelAdapter.getInitialState<LabelState>({
  uiFlags: {
    isLoading: false,
  },
});

const labelSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(labelActions.fetchLabels.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(labelActions.fetchLabels.fulfilled, (state, action) => {
        const { payload: labels } = action.payload;
        labelAdapter.setAll(state, labels);
        state.uiFlags.isLoading = false;
      })
      .addCase(labelActions.fetchLabels.rejected, (state, { error }) => {
        state.uiFlags.isLoading = false;
      });
  },
});

export default labelSlice.reducer;
