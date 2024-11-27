import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { Agent } from '@/types';
import { assignableAgentActions } from './assignableAgentActions';

export const assignableAgentAdapter = createEntityAdapter<Agent>({
  selectId: agent => agent.id,
});

export interface AssignableAgentState {
  uiFlags: {
    isLoading: boolean;
  };
}

const initialState = assignableAgentAdapter.getInitialState<AssignableAgentState>({
  uiFlags: {
    isLoading: false,
  },
});

const assignableAgentSlice = createSlice({
  name: 'assignableAgent',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(assignableAgentActions.fetchAgents.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(assignableAgentActions.fetchAgents.fulfilled, (state, action) => {
        const { payload: agents } = action.payload;
        assignableAgentAdapter.setAll(state, agents);
        state.uiFlags.isLoading = false;
      })
      .addCase(assignableAgentActions.fetchAgents.rejected, (state, { error }) => {
        state.uiFlags.isLoading = false;
      });
  },
});

export default assignableAgentSlice.reducer;
