import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  index: createAsyncThunk(
    'conversationLabels/index',
    async ({ conversationId }, { rejectWithValue }) => {
      try {
        const response = await APIHelper.get(`conversations/${conversationId}/labels`);
        const { payload } = response.data;
        return { labels: payload, conversationId };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  update: createAsyncThunk(
    'conversationLabels/update',
    async ({ conversationId, labels }, { rejectWithValue }) => {
      try {
        const response = await APIHelper.post(`conversations/${conversationId}/labels`, { labels });
        const { payload } = response.data;
        return { labels: payload, conversationId };
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
};

const conversationLabelAdapter = createEntityAdapter();

const initialState = conversationLabelAdapter.getInitialState({
  uiFlags: {
    loading: false,
  },
  records: {},
});

const conversationLabelSlice = createSlice({
  name: 'conversationLabels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(actions.index.pending, (state, action) => {
        state.uiFlags.loading = true;
      })
      .addCase(actions.index.fulfilled, (state, action) => {
        state.uiFlags.loading = false;
        const { conversationId, labels } = action.payload;
        state.records[conversationId] = labels;
      })
      .addCase(actions.index.rejected, (state, action) => {
        state.uiFlags.loading = false;
      })
      .addCase(actions.update.fulfilled, (state, action) => {
        const { conversationId, labels } = action.payload;
        state.records[conversationId] = labels;
      });
  },
});

export const selectConversationLabels = state => state.conversationLabels.records;

export const selectConversationLabelsLoading = state => state.conversationLabels.uiFlags.loading;

export default conversationLabelSlice.reducer;
