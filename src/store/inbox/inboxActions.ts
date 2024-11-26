import { createAsyncThunk } from '@reduxjs/toolkit';
import { InboxService } from './inboxService';
import type { InboxResponse } from './inboxTypes';

export const inboxActions = {
  fetchInboxes: createAsyncThunk<InboxResponse, void>(
    'inboxes/fetchInboxes',
    async (_, { rejectWithValue }) => {
      try {
        const response = await InboxService.index();
        return response;
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
