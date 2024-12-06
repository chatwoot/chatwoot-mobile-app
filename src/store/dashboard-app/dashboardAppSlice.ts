import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { DashboardApp } from '@/types';
import { dashboardAppActions } from './dashboardAppActions';
import { RootState } from '@/store';

export const dashboardAppAdapter = createEntityAdapter<DashboardApp>({
  selectId: dashboardApp => dashboardApp.id,
});

export interface DashboardAppState {
  uiFlags: {
    isLoading: boolean;
  };
}

const initialState = dashboardAppAdapter.getInitialState<DashboardAppState>({
  uiFlags: {
    isLoading: false,
  },
});

const dashboardAppSlice = createSlice({
  name: 'dashboardApps',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(dashboardAppActions.index.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(dashboardAppActions.index.fulfilled, (state, action) => {
        const { payload: dashboardApps } = action.payload;
        dashboardAppAdapter.setAll(state, dashboardApps);
        state.uiFlags.isLoading = false;
      })
      .addCase(dashboardAppActions.index.rejected, state => {
        state.uiFlags.isLoading = false;
      });
  },
});

export const { selectAll: selectAllDashboardApps, selectById: selectDashboardAppById } =
  dashboardAppAdapter.getSelectors((state: RootState) => state.dashboardApps);

export default dashboardAppSlice.reducer;
