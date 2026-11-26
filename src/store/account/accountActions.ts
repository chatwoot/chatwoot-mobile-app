import { createAsyncThunk } from '@reduxjs/toolkit';
import { AccountService } from './accountService';
import type { AccountResponse } from './accountTypes';

export const accountActions = {
  show: createAsyncThunk<AccountResponse, void>('account/show', async (_, { rejectWithValue }) => {
    try {
      return await AccountService.show();
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue({ message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }),
};
