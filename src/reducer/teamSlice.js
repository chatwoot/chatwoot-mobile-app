import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { pop } from 'helpers/NavigationHelper';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  fetchAllTeams: createAsyncThunk('teams/fetchAllTeams', async (params, { rejectWithValue }) => {
    try {
      const response = await APIHelper.get('teams');
      const { data } = response;
      return data;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  }),
  assignTeam: createAsyncThunk(
    'teams/assignTeam',
    async ({ conversationId, teamId }, { rejectWithValue }) => {
      try {
        const params = { team_id: teamId };
        const apiUrl = `conversations/${conversationId}/assignments`;
        await APIHelper.post(apiUrl, params);

        return conversationId;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
};

const teamsAdapter = createEntityAdapter({
  selectId: team => team.id,
});

const initialState = teamsAdapter.getInitialState({
  loading: false,
  isTeamUpdating: false,
});

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: {
    [actions.fetchAllTeams.pending]: state => {
      state.loading = true;
    },
    [actions.fetchAllTeams.fulfilled]: (state, action) => {
      state.loading = false;
      teamsAdapter.setAll(state, action.payload);
    },
    [actions.fetchAllTeams.rejected]: state => {
      state.loading = false;
    },
    [actions.assignTeam.pending]: state => {
      state.isTeamUpdating = true;
    },
    [actions.assignTeam.fulfilled]: (state, action) => {
      state.isTeamUpdating = false;
      pop(1);
    },
    [actions.assignTeam.rejected]: state => {
      state.isTeamUpdating = false;
    },
  },
});

export const teamSelector = teamsAdapter.getSelectors(state => state.teams);

export const selectLoading = state => state.teams.loading;

export const selectIsTeamUpdating = state => state.teams.isTeamUpdating;

export default teamSlice.reducer;
