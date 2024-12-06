import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { teamActions } from './teamActions';
import { Team } from '@/types';

export const teamAdapter = createEntityAdapter<Team>({
  selectId: inbox => inbox.id,
});

interface TeamState {
  uiFlags: {
    isLoading: boolean;
  };
}

const initialState = teamAdapter.getInitialState<TeamState>({
  uiFlags: {
    isLoading: false,
  },
});

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(teamActions.fetchTeams.pending, state => {
        state.uiFlags.isLoading = true;
      })
      .addCase(teamActions.fetchTeams.fulfilled, (state, action) => {
        state.uiFlags.isLoading = false;
        const { payload: teams } = action;
        teamAdapter.setAll(state, teams);
      })
      .addCase(teamActions.fetchTeams.rejected, (state, action) => {
        state.uiFlags.isLoading = false;
      });
  },
});

export default teamSlice.reducer;
