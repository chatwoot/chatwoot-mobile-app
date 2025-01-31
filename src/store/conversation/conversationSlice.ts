import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Conversation } from '@/types/Conversation';
import { conversationActions } from './conversationActions';
import { findPendingMessageIndex } from '@/utils/conversationUtils';

import { MESSAGE_TYPES } from '@/constants';
import { Message } from '@/types/Message';
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

      // If the conversation is not present in the store, we don't need to add the message
      if (!conversation) {
        return;
      }
      // If the message type is incoming, set the can reply to true
      if (message.messageType === MESSAGE_TYPES.INCOMING) {
        conversation.canReply = true;
      }
      // Check message is already present in the conversation
      const pendingMessageIndex = findPendingMessageIndex(conversation, message);
      if (pendingMessageIndex !== -1) {
        conversation.messages[pendingMessageIndex] = message as Message;
      }
      // If the message is not present in the conversation, add it
      else {
        conversation.messages.push(message as Message);
      }
      conversation.timestamp = message.createdAt;
      conversation.unreadCount = (message as Message).conversation?.unreadCount || 0;
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
