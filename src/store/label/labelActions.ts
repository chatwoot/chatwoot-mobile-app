import { createAsyncThunk } from '@reduxjs/toolkit';
import { LabelService } from './labelService';
import type { LabelResponse } from './labelTypes';

export const labelActions = {
  fetchLabels: createAsyncThunk<LabelResponse, void>(
    'labels/fetchLabels',
    async (_, { rejectWithValue }) => {
      try {
        const response = await LabelService.index();
        return response;
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
