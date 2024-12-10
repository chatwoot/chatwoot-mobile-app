import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { CannedResponse } from '@/types';
import { cannedResponseActions } from './cannedResponseActions';
import { RootState } from '@/store';

export const cannedResponseAdapter = createEntityAdapter<CannedResponse>({
  selectId: cannedResponse => cannedResponse.id,
});

export interface CannedResponseState {
  uiFlags: {
    isLoading: boolean;
  };
}

const initialState = cannedResponseAdapter.getInitialState<CannedResponseState>({
  uiFlags: {
    isLoading: false,
  },
});

const cannedResponseSlice = createSlice({
  name: 'dashboardApps',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(cannedResponseActions.index.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(cannedResponseActions.index.fulfilled, (state, action) => {
        const { payload: cannedResponses } = action.payload;
        cannedResponseAdapter.setAll(state, cannedResponses);
        state.uiFlags.isLoading = false;
      })
      .addCase(cannedResponseActions.index.rejected, state => {
        state.uiFlags.isLoading = false;
      });
  },
});

export const { selectAll: selectAllCannedResponses } = cannedResponseAdapter.getSelectors(
  (state: RootState) => state.cannedResponses,
);

export default cannedResponseSlice.reducer;
