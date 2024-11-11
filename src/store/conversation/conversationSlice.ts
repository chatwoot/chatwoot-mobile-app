import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Conversation } from '@/types/Conversation';
import { conversationActions } from './conversationActions';
import { transformConversation } from '@/utils';
import { findPendingMessageIndex } from '@/helpers/conversationHelpers';
import { MESSAGE_TYPES } from '@/constants';
import { Message } from '@/types/Message';

export interface ConversationState {
  meta: {
    mineCount: number;
    unassignedCount: number;
    allCount: number;
  };
  error: string | null;
  uiFlags: {
    isLoadingConversations: boolean;
    isAllConversationsFetched: boolean;
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
      const message = action.payload as Message;

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
      const pendingMessageIndex = findPendingMessageIndex(conversation, message);
      if (pendingMessageIndex !== -1) {
        conversation.messages[pendingMessageIndex] = message;
      } else {
        conversation.messages.push(message);
        conversation.timestamp = message.createdAt;
        const { conversation: { unreadCount = 0 } = {} } = message;
        conversation.unreadCount = unreadCount;
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
