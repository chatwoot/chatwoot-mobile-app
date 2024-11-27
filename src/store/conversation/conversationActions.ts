import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConversationService } from './conversationService';
import type {
  ConversationResponse,
  ConversationPayload,
  ApiErrorResponse,
  MessagesPayload,
  MessagesResponse,
  ConversationListResponse,
  ToggleConversationStatusPayload,
  BulkActionPayload,
  AssigneePayload,
  AssignTeamPayload,
  AssignTeamAPIResponse,
  AssigneeAPIResponse,
  MarkMessagesUnreadPayload,
  MarkMessageReadPayload,
  MarkMessageReadOrUnreadResponse,
  MuteOrUnmuteConversationPayload,
  ConversationLabelPayload,
  DeleteMessagePayload,
  DeleteMessageAPIResponse,
  TypingPayload,
  ToggleConversationStatusResponse,
} from './conversationTypes';
import { AxiosError } from 'axios';

export const conversationActions = {
  fetchConversations: createAsyncThunk<ConversationListResponse, ConversationPayload>(
    'conversations/fetchConversations',
    async (payload, { rejectWithValue }) => {
      try {
        return await ConversationService.getConversations(payload);
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
        return await ConversationService.fetchConversation(conversationId);
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
        return await ConversationService.fetchPreviousMessages(payload);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  toggleConversationStatus: createAsyncThunk<
    ToggleConversationStatusResponse,
    ToggleConversationStatusPayload
  >('conversations/toggleConversationStatus', async (payload, { rejectWithValue }) => {
    try {
      return await ConversationService.toggleConversationStatus(payload);
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
  assignTeam: createAsyncThunk<AssignTeamAPIResponse, AssignTeamPayload>(
    'conversations/assignTeam',
    async (payload, { rejectWithValue }) => {
      try {
        return await ConversationService.assignTeam(payload);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  markMessagesUnread: createAsyncThunk<
    MarkMessageReadOrUnreadResponse,
    MarkMessagesUnreadPayload,
    { rejectValue: ApiErrorResponse }
  >('conversations/markMessagesUnread', async (payload, { rejectWithValue }) => {
    try {
      return await ConversationService.markMessagesUnread(payload);
    } catch (error) {
      const { response } = error as AxiosError<ApiErrorResponse>;
      if (!response) {
        throw error;
      }
      return rejectWithValue(response.data);
    }
  }),
  markMessageRead: createAsyncThunk<
    MarkMessageReadOrUnreadResponse,
    MarkMessageReadPayload,
    { rejectValue: ApiErrorResponse }
  >('conversations/markMessageRead', async (payload, { rejectWithValue }) => {
    try {
      return await ConversationService.markMessageRead(payload);
    } catch (error) {
      const { response } = error as AxiosError<ApiErrorResponse>;
      if (!response) {
        throw error;
      }
      return rejectWithValue(response.data);
    }
  }),
  muteConversation: createAsyncThunk<
    {
      conversationId: number;
    },
    MuteOrUnmuteConversationPayload
  >('conversations/muteConversation', async (payload, { rejectWithValue }) => {
    await ConversationService.muteConversation(payload);
    return { conversationId: payload.conversationId };
  }),
  unmuteConversation: createAsyncThunk<
    {
      conversationId: number;
    },
    MuteOrUnmuteConversationPayload
  >('conversations/unmuteConversation', async (payload, { rejectWithValue }) => {
    await ConversationService.unmuteConversation(payload);
    return { conversationId: payload.conversationId };
  }),
  addOrUpdateConversationLabels: createAsyncThunk<void, ConversationLabelPayload>(
    'conversations/addOrUpdateConversationLabels',
    async (payload, { rejectWithValue }) => {
      await ConversationService.addOrUpdateConversationLabels(payload);
    },
  ),
  deleteMessage: createAsyncThunk<DeleteMessageAPIResponse, DeleteMessagePayload>(
    'conversations/deleteMessage',
    async (payload, { rejectWithValue }) => {
      return await ConversationService.deleteMessage(payload);
    },
  ),
  toggleTyping: createAsyncThunk<void, TypingPayload>(
    'conversations/toggleTyping',
    async (payload, { rejectWithValue }) => {
      return await ConversationService.toggleTyping(payload);
    },
  ),
};
