import { createAsyncThunk } from '@reduxjs/toolkit';
import { ContactService } from './contactService';

import { ContactConversationPayload } from './contactTypes';
import { transformConversation } from '@/utils';
import { Conversation } from '@/types';
export const contactConversationActions = {
  getContactConversations: createAsyncThunk<
    {
      contactId: number;
      conversations: Conversation[];
    },
    ContactConversationPayload
  >('contact/getContactConversations', async (payload, { rejectWithValue }) => {
    try {
      const response = await ContactService.getContactConversations(payload);
      const { payload: conversations } = response;
      const transformedResponse = conversations.map(transformConversation);
      return {
        contactId: payload.contactId,
        conversations: transformedResponse,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
};
