import { createAsyncThunk } from '@reduxjs/toolkit';
import { ContactService } from './contactService';

import { ContactLabelsPayload, UpdateContactLabelsPayload } from './contactTypes';

export const contactLabelActions = {
  getContactLabels: createAsyncThunk<
    {
      contactId: number;
      labels: string[];
    },
    ContactLabelsPayload
  >('contact/getContactLabels', async (payload, { rejectWithValue }) => {
    try {
      const response = await ContactService.getContactLabels(payload);
      const { payload: labels } = response;
      return { contactId: payload.contactId, labels };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
  updateContactLabels: createAsyncThunk<
    {
      contactId: number;
      labels: string[];
    },
    UpdateContactLabelsPayload
  >('contact/updateContactLabels', async (payload, { rejectWithValue }) => {
    try {
      const response = await ContactService.updateContactLabels(payload);
      const { payload: labels } = response;
      return { contactId: payload.contactId, labels };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
};
