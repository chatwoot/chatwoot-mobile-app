import { createAsyncThunk } from '@reduxjs/toolkit';
import { LabelService } from './labelService';
import type { LabelResponse } from './labelTypes';
import { transformLabel } from '@/utils/camelcaseKeys';

export const labelActions = {
  fetchLabels: createAsyncThunk<LabelResponse, void>(
    'labels/fetchLabels',
    async (_, { rejectWithValue }) => {
      try {
        const response = await LabelService.getLabels();
        const labels = response.payload.map(transformLabel);
        return {
          payload: labels,
        };
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
