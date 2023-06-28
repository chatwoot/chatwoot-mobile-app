import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  show: createAsyncThunk(
    'conversationWatchers/show',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const response = await APIHelper.get(`conversations/${conversationId}/participants`);
        const payload = response.data;
        return { watchersList: payload, conversationId };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  update: createAsyncThunk(
    'conversationWatchers/update',
    async ({ conversationId, userIds }, { rejectWithValue }) => {
      try {
        const response = await APIHelper.patch(`conversations/${conversationId}/participants`, {
          user_ids: userIds,
        });
        const payload = response.data;
        return { watchersList: payload, conversationId };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
};

const conversationWatchersAdapter = createEntityAdapter();

const initialState = conversationWatchersAdapter.getInitialState({
  uiFlags: {
    loading: false,
  },
  records: {},
});

const conversationWatchersSlice = createSlice({
  name: 'conversationWatchers',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(actions.show.pending, (state, action) => {
        state.uiFlags.loading = true;
      })
      .addCase(actions.show.fulfilled, (state, action) => {
        state.uiFlags.loading = false;
        const { conversationId, watchersList } = action.payload;
        state.records[conversationId] = watchersList;
      })
      .addCase(actions.show.rejected, (state, action) => {
        state.uiFlags.loading = false;
      })
      .addCase(actions.update.pending, (state, action) => {
        state.uiFlags.loading = true;
      })
      .addCase(actions.update.fulfilled, (state, action) => {
        state.uiFlags.loading = false;
        const { conversationId, watchersList } = action.payload;
        state.records[conversationId] = watchersList;
      })
      .addCase(actions.update.rejected, (state, action) => {
        state.uiFlags.loading = false;
      });
  },
});

export const selectConversationWatchers = state => state.conversationWatchers.records;

export const selectConversationWatchersLoading = state =>
  state.conversationWatchers.uiFlags.loading;

export default conversationWatchersSlice.reducer;
