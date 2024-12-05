import { createAsyncThunk } from '@reduxjs/toolkit';
import { TeamService } from './teamService';
import type { Team } from '@/types';

export const teamActions = {
  fetchTeams: createAsyncThunk<Team[], void>('teams/fetchTeams', async (_, { rejectWithValue }) => {
    try {
      const teams = await TeamService.getTeams();
      return teams;
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
};