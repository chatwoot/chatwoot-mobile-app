import { createAsyncThunk } from '@reduxjs/toolkit';
import { AssignableAgentService } from './assignableAgentService';
import type { AssignableAgentPayload, AssignableAgentResponse } from './assignableAgentTypes';

export const assignableAgentActions = {
  fetchAgents: createAsyncThunk<AssignableAgentResponse, AssignableAgentPayload>(
    'assignableAgents/fetchAgents',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await AssignableAgentService.getAgents(payload.inboxIds);
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
