import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConversationService } from './conversationService';
import type {
  ConversationResponse,
  ConversationPayload,
  ApiErrorResponse,
} from './conversationTypes';
import { AxiosError } from 'axios';
import { transformConversationMeta, transformConversation } from '@/utils';

export const conversationActions = {
  fetchConversations: createAsyncThunk<ConversationResponse, ConversationPayload>(
    'conversations/fetchConversations',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ConversationService.getConversations(payload);
        const { payload: conversations, meta } = response.data;
        const transformedResponse: ConversationResponse = {
          conversations: conversations.map(transformConversation),
          meta: transformConversationMeta(meta),
        };
        return transformedResponse;
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
};
