import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { DashboardApp } from '@/types';
import { dashboardAppActions } from './dashboardAppActions';
import { RootState } from '@/store';

export const dashboardAppAdapter = createEntityAdapter<DashboardApp>();

export interface DashboardAppState {
  isLoading: boolean;
}

const initialState = dashboardAppAdapter.getInitialState<DashboardAppState>({
  isLoading: false,
});

const dashboardAppSlice = createSlice({
  name: 'dashboardApps',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(dashboardAppActions.index.pending, state => {
        state.isLoading = true;
      })
      .addCase(dashboardAppActions.index.fulfilled, (state, action) => {
        const { payload: dashboardApps } = action.payload;
        dashboardAppAdapter.setAll(state, dashboardApps);
        state.isLoading = false;
      })
      .addCase(dashboardAppActions.index.rejected, state => {
        state.isLoading = false;
      });
  },
});

export const { selectAll: selectAllDashboardApps, selectById: selectDashboardAppById } =
  dashboardAppAdapter.getSelectors((state: RootState) => state.dashboardApps);

export default dashboardAppSlice.reducer;
