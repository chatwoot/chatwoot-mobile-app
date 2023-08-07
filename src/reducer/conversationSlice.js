import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
const lodashFilter = require('lodash.filter');
import actions from './conversationSlice.action';
import { MESSAGE_TYPES } from 'constants';
import { isEmptyObject } from 'helpers';
import { findPendingMessageIndex } from '../helpers/conversationHelpers';
export const conversationAdapter = createEntityAdapter({
  selectId: conversation => conversation.id,
});

const conversationSlice = createSlice({
  name: 'conversations',
  initialState: conversationAdapter.getInitialState({
    loading: false,
    meta: {
      mine_count: 0,
      unassigned_count: 0,
      all_count: 0,
    },
    isConversationFetching: false,
    isAllConversationsFetched: false,
    isAllMessagesFetched: false,
    conversationStatus: 'open',
    assigneeType: 'mine',
    sortFilter: 'latest',
    currentInbox: 0,
    loadingMessages: false,
    isChangingConversationStatus: false,
    isChangingConversationAssignee: false,
  }),
  reducers: {
    clearAllConversations: conversationAdapter.removeAll,
    setConversationStatus: (state, action) => {
      state.conversationStatus = action.payload;
    },
    setAssigneeType: (state, action) => {
      state.assigneeType = action.payload;
    },
    setActiveInbox: (state, action) => {
      state.currentInbox = action.payload;
    },
    setSortFilter: (state, action) => {
      state.sortFilter = action.payload;
    },
    clearConversation: (state, action) => {
      const conversationId = action.payload;
      const conversation = state.entities[conversationId];
      if (conversation) {
        conversationAdapter.removeOne(state, conversationId);
      }
    },
    addConversation: (state, action) => {
      const { currentInbox } = state;
      const conversation = action.payload;
      const { inbox_id: inboxId } = conversation;
      const isMatchingInboxFilter = !currentInbox || Number(currentInbox) === inboxId;
      if (isMatchingInboxFilter) {
        conversationAdapter.addOne(state, action.payload);
      }
    },
    updateConversation: (state, action) => {
      const conversation = action.payload;
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
      const message = action.payload;

      const { conversation_id: conversationId } = message;
      if (!conversationId) {
        return;
      }
      const conversation = state.entities[conversationId];

      // If the conversation is not present in the store, we don't need to add the message
      if (!conversation) {
        return;
      }
      // If the message type is incoming, set the can reply to true
      if (message.message_type === MESSAGE_TYPES.INCOMING) {
        conversation.can_reply = true;
      }
      const pendingMessageIndex = findPendingMessageIndex(conversation, message);
      if (pendingMessageIndex !== -1) {
        conversation.messages[pendingMessageIndex] = message;
      } else {
        conversation.messages.push(message);
        conversation.timestamp = message.created_at;
        const { conversation: { unread_count: unreadCount = 0 } = {} } = message;
        conversation.unread_count = unreadCount;
      }
    },
    updateConversationLastActivity: (state, action) => {
      const { conversationId, lastActivityAt } = action.payload;
      const conversation = state.entities[conversationId];
      if (!conversation) {
        return;
      }
      conversation.last_activity_at = lastActivityAt;
    },
    updateContactsPresence: (state, action) => {
      const { contacts } = action.payload;
      const allConversations = state.entities;
      if (isEmptyObject(contacts)) {
        return;
      }
      Object.keys(contacts).forEach(contactId => {
        let filteredConversations = lodashFilter(allConversations, {
          meta: { sender: { id: parseInt(contactId) } },
        });
        // TODO: This is a temporary fix for the issue of contact presence not updating if the contact goes offline, create contact store and update the contact presence there,
        //TODO: reference https://github.com/chatwoot/chatwoot/blob/develop/app/javascript/dashboard/store/modules/conversations/helpers/actionHelpers.js#L47
        filteredConversations.forEach(item => {
          state.entities[item.id].meta.sender.availability_status = contacts[contactId];
        });
      });
    },
  },

  extraReducers: builder => {
    builder
      .addCase(actions.fetchConversations.pending, state => {
        state.loading = true;
      })
      .addCase(actions.fetchConversations.fulfilled, (state, { payload }) => {
        conversationAdapter.upsertMany(state, payload.conversations);
        state.meta = payload.meta;
        state.loading = false;
        state.isAllConversationsFetched = payload.conversations.length < 20;
      })
      .addCase(actions.fetchConversations.rejected, (state, { error }) => {
        state.loading = false;
      })
      .addCase(actions.fetchConversationStats.fulfilled, (state, { payload }) => {
        state.meta = payload.meta;
      })
      .addCase(actions.fetchConversation.pending, state => {
        state.isConversationFetching = true;
      })
      .addCase(actions.fetchConversation.fulfilled, (state, { payload }) => {
        conversationAdapter.upsertOne(state, payload);
        state.isAllMessagesFetched = false;
        state.isConversationFetching = false;
      })
      .addCase(actions.fetchConversation.rejected, (state, { payload }) => {
        state.isConversationFetching = false;
      })
      .addCase(actions.fetchPreviousMessages.pending, state => {
        state.loadingMessages = true;
        state.isAllMessagesFetched = false;
      })
      .addCase(actions.fetchPreviousMessages.fulfilled, (state, { payload }) => {
        const { data, conversationId } = payload;
        if (!state.entities[conversationId]) {
          return;
        }
        const conversation = state.entities[conversationId];
        conversation.messages.unshift(...data);
        state.loadingMessages = false;
        state.isAllMessagesFetched = data.length < 20;
      })
      .addCase(actions.fetchPreviousMessages.rejected, state => {
        state.loadingMessages = false;
      })
      .addCase(actions.markMessagesAsRead.fulfilled, (state, { payload }) => {
        const { id, lastSeen } = payload;
        const conversation = state.entities[id];
        if (!conversation) {
          return;
        }
        conversation.unread_count = 0;
        conversation.agent_last_seen_at = lastSeen;
      })
      .addCase(actions.markMessagesAsUnread.fulfilled, (state, { payload }) => {
        const { id, unreadCount, lastSeen } = payload;
        const conversation = state.entities[id];
        if (!conversation) {
          return;
        }
        conversation.unread_count = unreadCount;
        conversation.agent_last_seen_at = lastSeen;
      })
      .addCase(actions.muteConversation.fulfilled, (state, { payload }) => {
        const { id } = payload;
        const conversation = state.entities[id];
        if (!conversation) {
          return;
        }
        conversation.muted = true;
      })
      .addCase(actions.unmuteConversation.fulfilled, (state, { payload }) => {
        const { id } = payload;
        const conversation = state.entities[id];
        if (!conversation) {
          return;
        }
        conversation.muted = false;
      })
      .addCase(actions.toggleConversationStatus.pending, (state, action) => {
        state.isChangingConversationStatus = true;
      })
      .addCase(actions.toggleConversationStatus.fulfilled, (state, { payload }) => {
        const { id, updatedStatus, updatedSnoozedUntil } = payload;
        const conversation = state.entities[id];
        if (!conversation) {
          return;
        }
        conversation.status = updatedStatus;
        conversation.snoozed_until = updatedSnoozedUntil;
        state.isChangingConversationStatus = false;
      })
      .addCase(actions.toggleConversationStatus.rejected, state => {
        state.isChangingConversationStatus = false;
      })
      .addCase(actions.togglePriority.fulfilled, (state, { payload }) => {
        const { id, priority } = payload;
        const conversation = state.entities[id];
        if (!conversation) {
          return;
        }
        conversation.priority = priority;
      });
  },
});
export const conversationSelector = conversationAdapter.getSelectors(state => state.conversations);

export const selectConversationMeta = state => state.conversations.meta;
export const selectAllConversationFetched = state => state.conversations.isAllConversationsFetched;
export const selectConversationStatus = state => state.conversations.conversationStatus;
export const selectAssigneeType = state => state.conversations.assigneeType;
export const selectActiveInbox = state => state.conversations.currentInbox;
export const selectSortFilter = state => state.conversations.sortFilter;
export const selectMessagesLoading = state => state.conversations.loadingMessages;
export const selectConversationFetching = state => state.conversations.isConversationFetching;
export const selectAllMessagesFetched = state => state.conversations.isAllMessagesFetched;
export const selectConversationToggleStatus = state =>
  state.conversations.isChangingConversationStatus;
export const selectConversationAssigneeStatus = state =>
  state.conversations.isChangingConversationAssignee;

export const {
  clearAllConversations,
  clearConversation,
  setConversationStatus,
  setAssigneeType,
  setActiveInbox,
  setSortFilter,
  addConversation,
  addOrUpdateMessage,
  updateConversation,
  updateContactsPresence,
  updateConversationLastActivity,
} = conversationSlice.actions;

export default conversationSlice.reducer;
