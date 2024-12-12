import { createSlice } from '@reduxjs/toolkit';
import type { Agent } from '@/types';
import { assignableAgentActions } from './assignableAgentActions';

export interface AssignableAgentState {
  records: {
    [key: string]: Agent[];
  };
  uiFlags: {
    isLoading: boolean;
  };
}

const initialState: AssignableAgentState = {
  records: {},
  uiFlags: {
    isLoading: false,
  },
};

const assignableAgentSlice = createSlice({
  name: 'assignableAgent',
  initialState,
  reducers: {
    clearAssignableAgents: state => {
      state.records = {};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(assignableAgentActions.fetchAgents.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(assignableAgentActions.fetchAgents.fulfilled, (state, action) => {
        const { inboxIds, agents } = action.payload;
        state.records = {
          ...state.records,
          [inboxIds.join(',')]: agents,
        };
        state.uiFlags.isLoading = false;
      })
      .addCase(assignableAgentActions.fetchAgents.rejected, (state, { error }) => {
        state.uiFlags.isLoading = false;
      });
  },
});

export const { clearAssignableAgents } = assignableAgentSlice.actions;

export default assignableAgentSlice.reducer;
