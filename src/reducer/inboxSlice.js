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
  name: 'inboxes',
  initialState: inboxAdapter.getInitialState({
    loading: false,
  }),
  extraReducers: builder => {
    builder
      .addCase(actions.fetchInboxes.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(actions.fetchInboxes.fulfilled, (state, action) => {
        inboxAdapter.setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(actions.fetchInboxes.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const inboxesSelector = inboxAdapter.getSelectors(state => state.inboxes);

export default inboxSlice.reducer;
