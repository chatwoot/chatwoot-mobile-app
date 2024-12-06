import { createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardAppService } from './dashboardAppService';
import type { DashboardAppResponse } from './dashboardAppTypes';

export const dashboardAppActions = {
  index: createAsyncThunk<DashboardAppResponse, void>(
    'dashboardApps/index',
    async (_, { rejectWithValue }) => {
      try {
        const response = await DashboardAppService.index();
        return response;
      } catch (error) {
        if (error instanceof Error) {
          return rejectWithValue({ message: error.message });
        }
        return rejectWithValue({ message: 'An unknown error occurred' });
      }
    },
  ),
};
