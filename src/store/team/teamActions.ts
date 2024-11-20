import { createAsyncThunk } from '@reduxjs/toolkit';
import { TeamService } from './teamService';
import type { Team } from '@/types';
import { transformTeam } from '@/utils';

export const teamActions = {
  fetchTeams: createAsyncThunk<Team[], void>('teams/fetchTeams', async (_, { rejectWithValue }) => {
    try {
      const response = await TeamService.getTeams();
      const teams = response.map(transformTeam);
      return teams;
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
};
