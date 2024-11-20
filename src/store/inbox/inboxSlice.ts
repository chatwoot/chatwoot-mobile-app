import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { Inbox } from '@/types/Inbox';
import { inboxActions } from './inboxActions';

const defaultInbox: Inbox = {
  id: 0,
  name: 'All Inboxes',
  channelType: 'Channel::All',
  avatarUrl: '',
  channelId: 0,
  phoneNumber: '',
  medium: 'Channel::All',
};

export const inboxAdapter = createEntityAdapter<Inbox>({
  selectId: inbox => inbox.id,
});

export interface InboxState {
  uiFlags: {
    isLoading: boolean;
  };
}

const initialState = inboxAdapter.getInitialState<InboxState>({
  uiFlags: {
    isLoading: false,
  },
});

const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(inboxActions.fetchInboxes.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(inboxActions.fetchInboxes.fulfilled, (state, action) => {
        const { payload: inboxes } = action.payload;
        const allInboxes = [defaultInbox, ...inboxes];
        inboxAdapter.setAll(state, allInboxes);
        state.uiFlags.isLoading = false;
      })
      .addCase(inboxActions.fetchInboxes.rejected, (state, { error }) => {
        state.uiFlags.isLoading = false;
      });
  },
});

export default inboxSlice.reducer;
