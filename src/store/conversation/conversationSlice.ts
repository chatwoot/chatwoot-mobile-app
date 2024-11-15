import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Conversation } from '@/types/Conversation';
import { conversationActions } from './conversationActions';
import { transformConversation, findPendingMessageIndex } from '@/utils';

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
  uiFlags: {
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    isAllConversationsFetched: boolean;
    isAllMessagesFetched: boolean;
    isConversationFetching: boolean;
  };
}

export const conversationAdapter = createEntityAdapter<Conversation>({
  selectId: conversation => conversation.id,
});

const initialState = conversationAdapter.getInitialState<ConversationState>({
  meta: {
    mineCount: 0,
    unassignedCount: 0,
    allCount: 0,
  },
  error: null,
  uiFlags: {
    isLoadingConversations: false,
    isAllConversationsFetched: false,
    isLoadingMessages: false,
    isAllMessagesFetched: false,
    isConversationFetching: false,
  },
});

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    clearAllConversations: conversationAdapter.removeAll,
    addConversation: (state, action) => {
      const conversation = action.payload;
      const camelCaseConversation = transformConversation(conversation);
      conversationAdapter.addOne(state, camelCaseConversation);
    },
    updateConversation: (state, action) => {
      const conversation = action.payload as Conversation;
      const camelCaseConversation = transformConversation(conversation);
      const conversationIds = conversationAdapter.getSelectors().selectIds(state);
      if (conversationIds.includes(camelCaseConversation.id)) {
        const { messages, ...conversationAttributes } = camelCaseConversation;
        conversationAdapter.updateOne(state, {
          id: camelCaseConversation.id,
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
        state.uiFlags.isLoadingConversations = true;
      })
      .addCase(conversationActions.fetchConversations.fulfilled, (state, { payload }) => {
        const { conversations, meta } = payload;
        conversationAdapter.upsertMany(state, conversations);
        state.uiFlags.isLoadingConversations = false;
        state.uiFlags.isAllConversationsFetched = conversations.length < 20 || false;
        state.meta = meta;
      })
      .addCase(conversationActions.fetchConversations.rejected, (state, { error }) => {
        state.uiFlags.isLoadingConversations = false;
      })
      .addCase(conversationActions.fetchConversation.pending, state => {
        state.uiFlags.isConversationFetching = true;
      })
      .addCase(conversationActions.fetchConversation.fulfilled, (state, { payload }) => {
        const { conversation } = payload;
        conversationAdapter.upsertOne(state, conversation);
        state.uiFlags.isConversationFetching = false;
        state.uiFlags.isAllMessagesFetched = false;
      })
      .addCase(conversationActions.fetchConversation.rejected, state => {
        state.uiFlags.isConversationFetching = false;
      })
      .addCase(conversationActions.fetchPreviousMessages.pending, state => {
        state.uiFlags.isLoadingMessages = true;
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
        state.uiFlags.isLoadingMessages = false;
        state.uiFlags.isAllMessagesFetched = messages.length < 20 || false;
      })
      .addCase(conversationActions.fetchPreviousMessages.rejected, state => {
        state.uiFlags.isLoadingMessages = false;
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
