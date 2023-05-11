import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  index: createAsyncThunk('teams/index', async (params, { rejectWithValue }) => {
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
  update: createAsyncThunk(
    'teams/update',
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
  uiFlags: {
    loading: false,
    isTeamUpdating: false,
  },
});

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(actions.index.pending, (state, action) => {
        state.uiFlags.loading = true;
      })
      .addCase(actions.index.fulfilled, (state, action) => {
        state.uiFlags.loading = false;
        teamsAdapter.setAll(state, action.payload);
      })
      .addCase(actions.index.rejected, (state, action) => {
        state.uiFlags.loading = false;
      })
      .addCase(actions.update.pending, (state, action) => {
        state.uiFlags.isTeamUpdating = true;
      })
      .addCase(actions.update.fulfilled, (state, action) => {
        state.uiFlags.isTeamUpdating = false;
      })
      .addCase(actions.update.rejected, (state, action) => {
        state.uiFlags.isTeamUpdating = false;
      });
  },
});

export const teamSelector = teamsAdapter.getSelectors(state => state.teams);

export const selectLoading = state => state.teams.uiFlags.loading;

export const selectIsTeamUpdating = state => state.teams.uiFlags.isTeamUpdating;

export default teamSlice.reducer;
