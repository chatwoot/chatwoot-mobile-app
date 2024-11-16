import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConversationService } from './conversationService';
import type {
  ConversationResponse,
  ConversationPayload,
  ApiErrorResponse,
  MessagesPayload,
  MessagesResponse,
  SendMessagePayload,
  SendMessageAPIResponse,
  ConversationListResponse,
  ToggleConversationStatusAPIResponse,
  ToggleConversationStatusPayload,
  BulkActionPayload,
  AssigneePayload,
  AssigneeAPIResponse,
} from './conversationTypes';
import { AxiosError } from 'axios';
import { addOrUpdateMessage } from './conversationSlice';
import {
  transformConversationMeta,
  transformConversation,
  transformMessage,
  transformConversationListMeta,
} from '@/utils';
import { buildCreatePayload, createPendingMessage } from '@/utils/messageUtils';
import { MESSAGE_STATUS } from '@/constants';
// import { Platform } from 'react-native';

export const conversationActions = {
  fetchConversations: createAsyncThunk<ConversationListResponse, ConversationPayload>(
    'conversations/fetchConversations',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ConversationService.getConversations(payload);
        const { payload: conversations, meta } = response.data;
        const transformedResponse: ConversationListResponse = {
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
  fetchConversation: createAsyncThunk<ConversationResponse, number>(
    'conversations/fetchConversation',
    async (conversationId, { rejectWithValue }) => {
      try {
        const response = await ConversationService.fetchConversation(conversationId);
        return {
          conversation: transformConversation(response),
        };
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
  sendMessage: createAsyncThunk<SendMessageAPIResponse, SendMessagePayload>(
    'conversations/sendMessage',
    async (sendMessagePayload, { dispatch, rejectWithValue }) => {
      const { conversationId } = sendMessagePayload;
      const pendingMessage = createPendingMessage(sendMessagePayload);

      try {
        dispatch(
          addOrUpdateMessage({
            ...pendingMessage,
            status: MESSAGE_STATUS.PROGRESS,
          }),
        );
        const payload = buildCreatePayload(pendingMessage);
        // const { file } = sendMessagePayload;
        // TODO: handle file upload
        // const contentType =
        //   Platform.OS === 'ios' && file
        //     ? file.type
        //     : Platform.OS === 'android' && file
        //       ? 'multipart/form-data'
        //       : 'application/json';

        const response = await ConversationService.sendMessage(conversationId, payload);

        const camelCaseMessage = transformMessage(response);

        dispatch(
          addOrUpdateMessage({
            ...camelCaseMessage,
            status: MESSAGE_STATUS.SENT,
          }),
        );
        return response;
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        const errorMessage = response?.data?.errors?.[0];
        dispatch(
          addOrUpdateMessage({
            ...pendingMessage,
            meta: {
              error: errorMessage,
            },
            status: MESSAGE_STATUS.FAILED,
          }),
        );
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  toggleConversationStatus: createAsyncThunk<
    ToggleConversationStatusAPIResponse,
    ToggleConversationStatusPayload
  >('conversations/toggleConversationStatus', async (payload, { rejectWithValue }) => {
    try {
      const response = await ConversationService.toggleConversationStatus(payload);
      return { payload: response.payload };
    } catch (error) {
      const { response } = error as AxiosError<ApiErrorResponse>;
      if (!response) {
        throw error;
      }
      return rejectWithValue(response.data);
    }
  }),
  bulkAction: createAsyncThunk<void, BulkActionPayload>(
    'conversations/bulkAction',
    async (payload, { rejectWithValue }) => {
      await ConversationService.bulkAction(payload);
    },
  ),
  assignConversation: createAsyncThunk<AssigneeAPIResponse, AssigneePayload>(
    'conversations/assignConversation',
    async (payload, { rejectWithValue }) => {
      try {
        return await ConversationService.assignConversation(payload);
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
