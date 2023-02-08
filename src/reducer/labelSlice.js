import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  fetchAllLabels: createAsyncThunk('labels/fetchAllLabels', async (params, { rejectWithValue }) => {
    try {
      const response = await APIHelper.get('labels');
      const { payload } = response.data;
      return payload;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  }),
};

const labelsAdapter = createEntityAdapter();

const initialState = labelsAdapter.getInitialState({
  loading: false,
});

const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(actions.fetchAllLabels.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(actions.fetchAllLabels.fulfilled, (state, action) => {
        state.loading = false;
        labelsAdapter.setAll(state, action.payload);
      })
      .addCase(actions.fetchAllLabels.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const labelsSelector = labelsAdapter.getSelectors(state => state.labels);

export const selectLabelLoading = state => state.labels.loading;

export default labelsSlice.reducer;
