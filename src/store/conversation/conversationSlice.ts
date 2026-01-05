import { Conversation } from '@/types/Conversation';
import { findPendingMessageIndex } from '@/utils/conversationUtils';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { conversationActions } from './conversationActions';

import { MESSAGE_TYPES } from '@/constants';
import { Message, MessageStatus } from '@/types/Message';
import { PendingMessage } from './conversationTypes';

export interface ConversationState {
  meta: {
    mineCount: number;
    unassignedCount: number;
    allCount: number;
  };
  error: string | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isAllConversationsFetched: boolean;
  isAllMessagesFetched: boolean;
  isConversationFetching: boolean;
  isChangingConversationStatus: boolean;
}

export const conversationAdapter = createEntityAdapter<Conversation>();

const initialState = conversationAdapter.getInitialState<ConversationState>({
  meta: {
    mineCount: 0,
    unassignedCount: 0,
    allCount: 0,
  },
  error: null,
  isLoadingConversations: false,
  isAllConversationsFetched: false,
  isLoadingMessages: false,
  isAllMessagesFetched: false,
  isConversationFetching: false,
  isChangingConversationStatus: false,
});

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    clearAllConversations: conversationAdapter.removeAll,
    addConversation: (state, action) => {
      const conversation = action.payload;
      conversationAdapter.addOne(state, conversation);
    },
    updateConversation: (state, action) => {
      const conversation = action.payload as Conversation;
      const conversationIds = conversationAdapter.getSelectors().selectIds(state);
      if (conversationIds.includes(conversation.id)) {
        const { messages, ...conversationAttributes } = conversation;
        conversationAdapter.updateOne(state, {
          id: conversation.id,
          changes: conversationAttributes,
        });
      } else {
        conversationAdapter.addOne(state, conversation);
      }
    },
    addOrUpdateMessage: (state, action) => {
      const message = action.payload as PendingMessage | Message;

      const { conversationId } = message;
      if (!conversationId) {
        return;
      }

      const conversation = state.entities[conversationId];

      if (!conversation) {
        return;
      }

      if (message.messageType === MESSAGE_TYPES.INCOMING) {
        conversation.canReply = true;
      }

      const pendingMessageIndex = findPendingMessageIndex(conversation, message);
      const isNewMessage = pendingMessageIndex === -1;
      const isIncomingMessage = message.messageType === MESSAGE_TYPES.INCOMING;

      if (pendingMessageIndex !== -1) {
        const existingMessage = conversation.messages[pendingMessageIndex];
        const incomingStatus = (message.status || existingMessage.status) as MessageStatus;

        const finalStatus: MessageStatus =
          incomingStatus === 'failed'
            ? 'failed'
            : incomingStatus === 'read' || incomingStatus === 'delivered'
              ? incomingStatus
              : incomingStatus;

        const existingMeta = (existingMessage as { meta?: { error?: string } }).meta;
        const newMeta = (message as { meta?: { error?: string } }).meta;
        const contentAttrs = message.contentAttributes as
          | Record<string, unknown>
          | null
          | undefined;
        const externalError = contentAttrs?.externalError || contentAttrs?.external_error;

        const updatedMessage: Message & { meta?: { error?: string } } = {
          ...(message as Message),
          echoId: (message as Message).echoId ?? existingMessage.echoId,
          status: finalStatus,
        };

        if (externalError && finalStatus === 'failed') {
          const errorText =
            typeof externalError === 'string' ? externalError : JSON.stringify(externalError);
          updatedMessage.meta = {
            error: errorText,
          };
        } else if (newMeta) {
          updatedMessage.meta = newMeta;
        } else if (existingMeta && existingMeta.error) {
          updatedMessage.meta = existingMeta;
        }

        conversation.messages[pendingMessageIndex] = updatedMessage as Message;
      } else {
        conversation.messages.push(message as Message);
      }

      conversation.timestamp = message.createdAt;
      
      // Atualizar unreadCount: priorizar o valor do backend, mas se for uma nova mensagem INCOMING
      // e o unreadCount não vier do backend, incrementar o contador atual
      const backendUnreadCount = (message as Message).conversation?.unreadCount;
      if (backendUnreadCount !== undefined && backendUnreadCount !== null) {
        // Se o backend enviou o unreadCount, usar esse valor
        conversation.unreadCount = backendUnreadCount;
      } else if (isNewMessage && isIncomingMessage && message.status !== 'read') {
        // Se é uma nova mensagem INCOMING não lida e o backend não enviou o unreadCount,
        // incrementar o contador atual
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      } else {
        // Caso contrário, manter o valor atual ou usar 0 se não existir
        conversation.unreadCount = conversation.unreadCount || 0;
      }
    },
    updateConversationLastActivity: (state, action) => {
      const { conversationId, lastActivityAt } = action.payload;
      const conversation = state.entities[conversationId];
      if (!conversation) {
        return;
      }
      conversation.lastActivityAt = lastActivityAt;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(conversationActions.fetchConversations.pending, state => {
        state.error = null;
        state.isLoadingConversations = true;
      })
      .addCase(conversationActions.fetchConversations.fulfilled, (state, { payload }) => {
        const { conversations, meta } = payload;
        conversationAdapter.upsertMany(state, conversations);
        state.isLoadingConversations = false;
        state.isAllConversationsFetched = conversations.length < 20 || false;
        state.meta = meta;
      })
      .addCase(conversationActions.fetchConversations.rejected, (state, { error }) => {
        state.isLoadingConversations = false;
      })
      .addCase(conversationActions.fetchConversation.pending, state => {
        state.error = null;
        state.isConversationFetching = true;
      })
      .addCase(conversationActions.fetchConversation.fulfilled, (state, { payload }) => {
        const { conversation } = payload;
        conversationAdapter.upsertOne(state, conversation);
        state.isConversationFetching = false;
        state.isAllMessagesFetched = false;
      })
      .addCase(conversationActions.fetchConversation.rejected, state => {
        state.isConversationFetching = false;
        state.error = state.error || 'Unable to load conversation';
      })
      .addCase(conversationActions.fetchPreviousMessages.pending, state => {
        state.isLoadingMessages = true;
      })
      .addCase(conversationActions.fetchPreviousMessages.fulfilled, (state, { payload }) => {
        const { messages, conversationId, meta } = payload;
        if (!state.entities[conversationId]) {
          return;
        }
        const conversation = state.entities[conversationId];
        conversation.messages.unshift(...messages);
        conversation.meta = {
          ...conversation.meta,
          ...meta,
        };
        state.isLoadingMessages = false;
        state.isAllMessagesFetched = messages.length < 20 || false;
      })
      .addCase(conversationActions.fetchPreviousMessages.rejected, state => {
        state.isLoadingMessages = false;
      })
      .addCase(conversationActions.toggleConversationStatus.pending, (state, action) => {
        state.isChangingConversationStatus = true;
      })
      .addCase(conversationActions.toggleConversationStatus.fulfilled, (state, { payload }) => {
        const { conversationId, currentStatus, snoozedUntil } = payload;
        const conversation = state.entities[conversationId];
        if (!conversation) {
          return;
        }
        conversation.status = currentStatus;
        conversation.snoozedUntil = snoozedUntil;
        state.isChangingConversationStatus = false;
      })
      .addCase(conversationActions.toggleConversationStatus.rejected, state => {
        state.isChangingConversationStatus = false;
      })
      .addCase(conversationActions.muteConversation.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conversation = state.entities[conversationId];
        if (!conversation) {
          return;
        }
        conversation.muted = true;
      })
      .addCase(conversationActions.unmuteConversation.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conversation = state.entities[conversationId];
        if (!conversation) {
          return;
        }
        conversation.muted = false;
      })
      .addCase(conversationActions.markMessagesUnread.fulfilled, (state, action) => {
        const { conversationId, unreadCount, agentLastSeenAt } = action.payload;
        const conversation = state.entities[conversationId];
        if (!conversation) {
          return;
        }
        conversation.unreadCount = unreadCount;
        conversation.agentLastSeenAt = agentLastSeenAt;
      })
      .addCase(conversationActions.markMessageRead.fulfilled, (state, action) => {
        const { conversationId, agentLastSeenAt, unreadCount } = action.payload;
        const conversation = state.entities[conversationId];
        if (!conversation) {
          return;
        }
        conversation.unreadCount = unreadCount;
        conversation.agentLastSeenAt = agentLastSeenAt;
      });
  },
});

export const {
  clearAllConversations,
  updateConversation,
  updateConversationLastActivity,
  addOrUpdateMessage,
  addConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
