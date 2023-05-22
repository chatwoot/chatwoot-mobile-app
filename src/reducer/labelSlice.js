import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  index: createAsyncThunk('labels/index', async (params, { rejectWithValue }) => {
    try {
      const response = await APIHelper.get('labels');
      const { payload } = response.data;
      return payload;
    } catch (error) {
      return rejectWithValue(error);
    }
  }),
};

const labelsAdapter = createEntityAdapter();

const initialState = labelsAdapter.getInitialState({
  uiFlags: {
    loading: false,
  },
});

const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(actions.index.pending, (state, action) => {
        state.uiFlags.loading = true;
      })
      .addCase(actions.index.fulfilled, (state, action) => {
        state.uiFlags.loading = false;
        labelsAdapter.setAll(state, action.payload);
      })
      .addCase(actions.index.rejected, (state, action) => {
        state.uiFlags.loading = false;
      });
  },
});

export const labelsSelector = labelsAdapter.getSelectors(state => state.labels);

export const selectLabelLoading = state => state.labels.uiFlags.loading;

export default labelsSlice.reducer;
