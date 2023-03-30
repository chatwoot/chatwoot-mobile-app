import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  index: createAsyncThunk(
    'dashboardApps/gatAllDashboardApps',
    async (params, { rejectWithValue }) => {
      try {
        const response = await APIHelper.get('dashboard_apps');
        const { data } = response;
        return data;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
};

const dashboardAppsAdapter = createEntityAdapter({
  selectId: dashboardApp => dashboardApp.id,
});

const initialState = dashboardAppsAdapter.getInitialState({
  loading: false,
});

const dashboardAppSlice = createSlice({
  name: 'dashboardApps',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(actions.index.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(actions.index.fulfilled, (state, action) => {
        state.loading = false;
        dashboardAppsAdapter.setAll(state, action.payload);
      })
      .addCase(actions.index.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const dashboardAppSelector = dashboardAppsAdapter.getSelectors(state => state.dashboardApps);

export default dashboardAppSlice.reducer;
