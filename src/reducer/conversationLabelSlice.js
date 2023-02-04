import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  fetchConversationLabels: createAsyncThunk(
    'labels/fetchConversationLabels',
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
  updateConversationLabels: createAsyncThunk(
    'labels/updateConversationLabels',
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
  loading: false,
  records: {},
});

const conversationLabelSlice = createSlice({
  name: 'conversationLabels',
  initialState,
  reducers: {},
  extraReducers: {
    [actions.fetchConversationLabels.pending]: (state, action) => {
      state.loading = true;
    },
    [actions.fetchConversationLabels.fulfilled]: (state, action) => {
      state.loading = false;
      const { conversationId, labels } = action.payload;
      state.records[conversationId] = labels;
    },
    [actions.fetchConversationLabels.rejected]: (state, action) => {
      state.loading = false;
    },
    [actions.updateConversationLabels.fulfilled]: (state, action) => {
      const { conversationId, labels } = action.payload;
      state.records[conversationId] = labels;
    },
  },
});

export const selectConversationLabels = state => state.conversationLabels.records;

export const selectConversationLabelsLoading = state => state.conversationLabels.loading;

export default conversationLabelSlice.reducer;
