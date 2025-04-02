import { createAsyncThunk } from '@reduxjs/toolkit';
import { MacroService } from './macroService';
import type { MacroResponse } from './macroTypes';

export const macroActions = {
  fetchMacros: createAsyncThunk<MacroResponse, void>(
    'macros/fetchMacros',
    async (_, { rejectWithValue }) => {
      try {
        const response = await MacroService.index();
        return response;
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),

  executeMacro: createAsyncThunk<void, { macroId: number; conversationIds: number[] }>(
    'macros/executeMacro',
    async ({ macroId, conversationIds }, { rejectWithValue }) => {
      try {
        await MacroService.executeMacro(macroId, conversationIds);
      } catch (error) {
        console.error('error', error);
        const message = error instanceof Error ? error.message : 'Failed to execute macro';
        return rejectWithValue(message);
      }
    },
  ),
};
