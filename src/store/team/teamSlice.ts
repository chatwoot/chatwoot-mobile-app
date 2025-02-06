import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { teamActions } from './teamActions';
import { Team } from '@/types';

export const teamAdapter = createEntityAdapter<Team>();

interface TeamState {
  isLoading: boolean;
}

const initialState = teamAdapter.getInitialState<TeamState>({
  isLoading: false,
});

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(teamActions.fetchTeams.pending, state => {
        state.isLoading = true;
      })
      .addCase(teamActions.fetchTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        const { payload: teams } = action;
        teamAdapter.setAll(state, teams);
      })
      .addCase(teamActions.fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export default teamSlice.reducer;
