import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { Agent } from '@/types';
import { inboxAgentActions } from './inboxAgentActions';

export const inboxAgentAdapter = createEntityAdapter<Agent>({
  selectId: agent => agent.id,
});

export interface InboxAgentState {
  uiFlags: {
    isLoading: boolean;
  };
}

const initialState = inboxAgentAdapter.getInitialState<InboxAgentState>({
  uiFlags: {
    isLoading: false,
  },
});

const inboxAgentSlice = createSlice({
  name: 'inboxAgent',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(inboxAgentActions.fetchInboxAgents.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(inboxAgentActions.fetchInboxAgents.fulfilled, (state, action) => {
        const { payload: agents } = action.payload;
        inboxAgentAdapter.setAll(state, agents);
        state.uiFlags.isLoading = false;
      })
      .addCase(inboxAgentActions.fetchInboxAgents.rejected, (state, { error }) => {
        state.uiFlags.isLoading = false;
      });
  },
});

export default inboxAgentSlice.reducer;
