import { MESSAGE_STATUS } from '@/constants';
import { transformMessage } from '@/utils/camelCaseKeys';
import { buildCreatePayload, createPendingMessage } from '@/utils/messageUtils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { Platform } from 'react-native';
import { ConversationService } from './conversationService';
import type {
  ApiErrorResponse,
  AssigneeAPIResponse,
  AssigneePayload,
  AssignTeamAPIResponse,
  AssignTeamPayload,
  BulkActionPayload,
  BulkMoveToInboxAPIResponse,
  BulkMoveToInboxPayload,
  ConversationLabelPayload,
  ConversationListResponse,
  ConversationPayload,
  ConversationResponse,
  DeleteMessageAPIResponse,
  DeleteMessagePayload,
  MarkMessageReadOrUnreadResponse,
  MarkMessageReadPayload,
  MarkMessagesUnreadPayload,
  MessagesPayload,
  MessagesResponse,
  MoveToInboxAPIResponse,
  MoveToInboxPayload,
  MuteOrUnmuteConversationPayload,
  SendMessageAPIResponse,
  SendMessagePayload,
  ToggleConversationStatusPayload,
  ToggleConversationStatusResponse,
  TogglePriorityPayload,
  TypingPayload,
} from './conversationTypes';

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
  sendMessage: createAsyncThunk<SendMessageAPIResponse, SendMessagePayload>(
    'conversations/sendMessage',
    async (sendMessagePayload, { dispatch, rejectWithValue }) => {
      const { conversationId } = sendMessagePayload;
      const pendingMessage = createPendingMessage(sendMessagePayload);

      try {
        dispatch({
          type: 'conversation/addOrUpdateMessage',
          payload: {
            ...pendingMessage,
            status: MESSAGE_STATUS.PROGRESS,
          },
        });

        const payload = buildCreatePayload(pendingMessage);
        const { file } = sendMessagePayload;
        const contentType =
          Platform.OS === 'ios' && file
            ? file.type
            : Platform.OS === 'android' && file
              ? 'multipart/form-data'
              : 'application/json';

        const FILE_UPLOAD_TIMEOUT = 60000;
        const DEFAULT_TIMEOUT = 30000;
        const timeout = file ? FILE_UPLOAD_TIMEOUT : DEFAULT_TIMEOUT;

        const response = await ConversationService.sendMessage(conversationId, payload, {
          headers: {
            'Content-Type': contentType,
          },
          timeout,
        });

        const camelCaseMessage = transformMessage(response);

        console.log('[sendMessage] Mensagem enviada com sucesso:', {
          conversationId,
          messageId: camelCaseMessage.id,
          echoId: camelCaseMessage.echoId ?? pendingMessage.echoId,
          content: camelCaseMessage.content?.substring(0, 50),
          status: camelCaseMessage.status,
        });

        dispatch({
          type: 'conversation/addOrUpdateMessage',
          payload: {
            ...camelCaseMessage,
            echoId: camelCaseMessage.echoId ?? pendingMessage.echoId,
            status: MESSAGE_STATUS.SENT,
          },
        });

        return response;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const { response, code, message } = axiosError;

        console.error('[sendMessage] Erro ao enviar mensagem:', {
          conversationId,
          echoId: pendingMessage.echoId,
          content: pendingMessage.content?.substring(0, 50),
          hasFile: !!sendMessagePayload.file,
          errorCode: code,
          errorMessage: message,
          status: response?.status,
          statusText: response?.statusText,
          responseData: response?.data,
          configUrl: axiosError.config?.url,
          configMethod: axiosError.config?.method,
        });

        const isTimeout = code === 'ECONNABORTED' || message?.includes('timeout');
        const isNetworkError = code === 'ERR_NETWORK' || message?.includes('Network Error');
        const isRateLimited = response?.status === 429;
        const isServerError = response?.status && response.status >= 500;

        let errorMessage = 'Erro ao enviar mensagem. Tente novamente.';

        if (isTimeout) {
          errorMessage = 'Tempo de envio esgotado. Verifique sua conexão e tente novamente.';
          console.error('[sendMessage] Timeout detectado');
        } else if (isNetworkError) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          console.error('[sendMessage] Erro de rede detectado');
        } else if (isRateLimited) {
          errorMessage = 'Muitas mensagens enviadas. Aguarde um momento e tente novamente.';
          console.error('[sendMessage] Rate limit detectado (429)');
        } else if (isServerError) {
          errorMessage = 'Erro no servidor. Tente novamente em alguns instantes.';
          console.error('[sendMessage] Erro do servidor detectado:', response?.status);
        } else if (response?.data?.errors?.[0]) {
          errorMessage = response.data.errors[0];
          console.error('[sendMessage] Erro da API:', response.data.errors);
        } else if (response?.status) {
          console.error('[sendMessage] Status HTTP não tratado:', response.status);
        } else {
          console.error('[sendMessage] Erro desconhecido sem resposta');
        }

        dispatch({
          type: 'conversation/addOrUpdateMessage',
          payload: {
            ...pendingMessage,
            meta: {
              error: errorMessage,
              errorCode: code,
              errorStatus: response?.status,
              errorDetails: {
                message: message,
                statusText: response?.statusText,
                responseData: response?.data,
              },
            },
            status: MESSAGE_STATUS.FAILED,
          },
        });

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
  togglePriority: createAsyncThunk<void, TogglePriorityPayload>(
    'conversations/togglePriority',
    async (payload, { rejectWithValue }) => {
      return await ConversationService.togglePriority(payload);
    },
  ),
  moveConversationToInbox: createAsyncThunk<MoveToInboxAPIResponse, MoveToInboxPayload>(
    'conversations/moveConversationToInbox',
    async (payload, { rejectWithValue, dispatch }) => {
      try {
        const response = await ConversationService.moveConversationToInbox(payload);

        const conversationId = response.payload?.id || response.id || payload.conversationId;
        const inboxId = response.payload?.inbox_id || response.inbox_id || payload.inboxId;

        dispatch({
          type: 'conversation/updateConversation',
          payload: {
            id: conversationId,
            inboxId: inboxId,
          },
        });

        return response;
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  bulkMoveConversationsToInbox: createAsyncThunk<
    BulkMoveToInboxAPIResponse,
    BulkMoveToInboxPayload
  >(
    'conversations/bulkMoveConversationsToInbox',
    async (payload, { rejectWithValue, dispatch }) => {
      try {
        const response = await ConversationService.bulkMoveConversationsToInbox(payload);

        const inboxId = response.payload?.inbox_id || response.inbox_id || payload.inboxId;

        payload.conversationIds.forEach(conversationId => {
          dispatch({
            type: 'conversation/updateConversation',
            payload: {
              id: conversationId,
              inboxId: inboxId,
            },
          });
        });

        return response;
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
