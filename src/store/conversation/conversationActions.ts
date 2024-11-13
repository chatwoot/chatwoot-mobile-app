import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConversationService } from './conversationService';
import type {
  ConversationResponse,
  ConversationPayload,
  ApiErrorResponse,
  MessagesPayload,
  MessagesResponse,
} from './conversationTypes';
import { AxiosError } from 'axios';
import {
  transformConversationMeta,
  transformConversation,
  transformMessage,
  transformConversationListMeta,
} from '@/utils';

export const conversationActions = {
  fetchConversations: createAsyncThunk<ConversationResponse, ConversationPayload>(
    'conversations/fetchConversations',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ConversationService.getConversations(payload);
        const { payload: conversations, meta } = response.data;
        const transformedResponse: ConversationResponse = {
          conversations: conversations.map(transformConversation),
          meta: transformConversationListMeta(meta),
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
  fetchPreviousMessages: createAsyncThunk<MessagesResponse, MessagesPayload>(
    'conversations/fetchPreviousMessages',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ConversationService.fetchPreviousMessages(payload);
        const { payload: messages, meta } = response;
        const transformedResponse: MessagesResponse = {
          messages: messages.map(transformMessage),
          meta: transformConversationMeta(meta),
          conversationId: payload.conversationId,
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
