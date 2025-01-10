import { createAsyncThunk } from '@reduxjs/toolkit';
import { CustomAttributeService } from './customAttributeService';
import type { CustomAttributeResponse } from './customAttributeTypes';

export const customAttributeActions = {
  index: createAsyncThunk<CustomAttributeResponse, void>(
    'customAttributes/index',
    async (_, { rejectWithValue }) => {
      try {
        const response = await CustomAttributeService.index();
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
