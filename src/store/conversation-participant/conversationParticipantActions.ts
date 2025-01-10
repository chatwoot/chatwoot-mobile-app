import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConversationParticipantService } from './conversationParticipantService';
import type {
  ConversationParticipantPayload,
  ConversationParticipantResponse,
  UpdateConversationParticipantPayload,
} from './conversationParticipantTypes';

export const conversationParticipantActions = {
  index: createAsyncThunk<ConversationParticipantResponse, ConversationParticipantPayload>(
    'conversationParticipants/index',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ConversationParticipantService.index(payload);
        return response;
      } catch (error) {
        if (error instanceof Error) {
          return rejectWithValue({ message: error.message });
        }
        return rejectWithValue({ message: 'An unknown error occurred' });
      }
    },
  ),

  update: createAsyncThunk<ConversationParticipantResponse, UpdateConversationParticipantPayload>(
    'conversationParticipants/update',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ConversationParticipantService.update(payload);
        return response;
      } catch (error) {
        if (error instanceof Error) {
          return rejectWithValue({ message: error.message });
        }
        return rejectWithValue({ message: 'An unknown error occurred' });
      }
    },
  ),
};
