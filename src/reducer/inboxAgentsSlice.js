import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  createDraftSafeSelector,
} from '@reduxjs/toolkit';
import axios from 'helpers/APIHelper';

export const actions = {
  fetchInboxAgents: createAsyncThunk(
    'inboxAgents/fetchInboxAgents',
    async ({ inboxId }, { rejectWithValue }) => {
      try {
        const response = await axios.get(`inboxes/${inboxId}/assignable_agents`);
        const { payload } = response.data;
        return payload;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
};

const inboxAgentAdapter = createEntityAdapter({
  selectId: agent => agent.id,
});
const inboxAgentSlice = createSlice({
  name: 'inboxAgents',
  initialState: inboxAgentAdapter.getInitialState({
    isFetching: false,
  }),
  reducers: {
    updateAgentsPresence: (state, action) => {
      const agentIds = state.ids;
      const { users: agents } = action.payload;
      agentIds.forEach(id => {
        const agent = state.entities[id];
        const availabilityStatus = agents[id] || 'offline';
        if (agent) {
          inboxAgentAdapter.updateOne(state, {
            id,
            changes: { availability_status: availabilityStatus },
          });
        }
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(actions.fetchInboxAgents.pending, state => {
        state.isFetching = true;
      })
      .addCase(actions.fetchInboxAgents.fulfilled, (state, action) => {
        state.isFetching = false;
        inboxAgentAdapter.setAll(state, action.payload);
      })
      .addCase(actions.fetchInboxAgents.rejected, state => {
        state.isFetching = false;
      });
  },
});

export const inboxAgentSelector = inboxAgentAdapter.getSelectors(state => state.inboxAgents);

export const selectInboxFetching = state => state.inboxAgents.isFetching;

export const inboxAgentSelectors = {
  inboxAssignedAgents: createDraftSafeSelector(inboxAgentSelector.selectAll, agents =>
    agents.filter(agent => agent.confirmed),
  ),
};

export const { updateAgentsPresence } = inboxAgentSlice.actions;

export default inboxAgentSlice.reducer;
