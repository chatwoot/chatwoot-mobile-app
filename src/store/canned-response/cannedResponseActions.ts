import { createAsyncThunk } from '@reduxjs/toolkit';
import { CannedResponseService } from './cannedResponseService';
import type { CannedResponseResponse } from './cannedResponseTypes';

export const cannedResponseActions = {
  index: createAsyncThunk<CannedResponseResponse, { searchKey: string }>(
    'cannedResponses/index',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await CannedResponseService.index(payload.searchKey);
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
