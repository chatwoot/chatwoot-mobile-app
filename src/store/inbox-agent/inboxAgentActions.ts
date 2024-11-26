import { createAsyncThunk } from '@reduxjs/toolkit';
import { InboxAgentService } from './inboxAgentService';
import type { InboxAgentAPIResponse, InboxAgentPayload } from './inboxAgentTypes';
import { transformInboxAgent } from '@/utils/camelCaseKeys';

export const inboxAgentActions = {
  fetchInboxAgents: createAsyncThunk<InboxAgentAPIResponse, InboxAgentPayload>(
    'inboxAgents/fetchInboxAgents',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await InboxAgentService.getInboxAgents(payload.inboxIds);
        const inboxes = response.payload.map(transformInboxAgent);
        return {
          payload: inboxes,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
