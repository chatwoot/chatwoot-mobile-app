import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'helpers/APIHelper';

const defaultInbox = { id: 0, name: 'All', channel_type: 'Channel::All' };

export const actions = {
  fetchInboxes: createAsyncThunk('inboxes/fetchInboxes', async () => {
    const response = await axios.get('inboxes');
    let { payload = [] } = response.data;
    return [defaultInbox, ...payload];
  }),
};

export const inboxAdapter = createEntityAdapter({
  selectId: inbox => inbox.id,
});

const inboxSlice = createSlice({
  name: 'inbox',
  initialState: inboxAdapter.getInitialState({
    loading: false,
  }),

  extraReducers: {
    [actions.fetchInboxes.pending]: state => {
      state.loading = true;
    },
    [actions.fetchInboxes.fulfilled]: (state, { payload }) => {
      inboxAdapter.setAll(state, payload);
      state.loading = false;
    },
    [actions.fetchInboxes.rejected]: (state, { error }) => {
      state.loading = false;
    },
  },
});

export const inboxesSelector = inboxAdapter.getSelectors(state => state.inbox);

export default inboxSlice.reducer;
