import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { Inbox } from '@/types/Inbox';
import { inboxActions } from './inboxActions';

export const inboxAdapter = createEntityAdapter<Inbox>();

export interface InboxState {
  isLoading: boolean;
}

const initialState = inboxAdapter.getInitialState<InboxState>({
  isLoading: false,
});

const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(inboxActions.fetchInboxes.pending, state => {
        state.isLoading = true;
      })
      .addCase(inboxActions.fetchInboxes.fulfilled, (state, action) => {
        const { payload: inboxes } = action.payload;
        inboxAdapter.setAll(state, inboxes);
        state.isLoading = false;
      })
      .addCase(inboxActions.fetchInboxes.rejected, (state, { error }) => {
        state.isLoading = false;
      });
  },
});

export default inboxSlice.reducer;
