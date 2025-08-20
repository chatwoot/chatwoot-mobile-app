import { createAsyncThunk } from '@reduxjs/toolkit';
import { ContactService } from './contactService';

import { ContactLabelsPayload, ToggleAIPayload } from './contactTypes';

export const contactActions = {
  getContactLabels: createAsyncThunk<
    {
      contactId: number;
      labels: string[];
    },
    ContactLabelsPayload
  >('contact/getContactLabels', async (payload, { rejectWithValue }) => {
    try {
      const response = await ContactService.getContactLabels(payload);
      const { payload: labels } = response.data;
      return { contactId: payload.contactId, labels };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
  
  toggleAI: createAsyncThunk<
    {
      contactId: number;
      aiEnabled: boolean;
    },
    ToggleAIPayload
  >('contact/toggleAI', async (payload, { rejectWithValue }) => {
    try {
      const response = await ContactService.toggleAI(payload);
      return {
        contactId: payload.contactId,
        aiEnabled: response.ai_enabled,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
};
