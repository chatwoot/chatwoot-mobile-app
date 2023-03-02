import { createSlice, createEntityAdapter, createDraftSafeSelector } from '@reduxjs/toolkit';
const lodashFilter = require('lodash.filter');
import actions from './conversationSlice.action';
import { applyFilters, findPendingMessageIndex } from '../helpers/conversationHelpers';
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
    addMessage: (state, action) => {
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
      const pendingMessageIndex = findPendingMessageIndex(conversation, message);
      if (pendingMessageIndex !== -1) {
        conversation.messages[pendingMessageIndex] = message;
      } else {
        conversation.messages.push(message);
        conversation.timestamp = message.created_at;
      }
    },
    updateContactsPresence: (state, action) => {
      const { contacts } = action.payload;
      const allConversations = state.entities;

      Object.keys(contacts).forEach(contactId => {
        let filteredConversations = lodashFilter(allConversations, {
          meta: { sender: { id: parseInt(contactId) } },
        });
        // TODO: This is a temporary fix for the issue of contact presence not updating if the contact goes offline
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
        conversation.agent_last_seen_at = lastSeen;
      })
      .addCase(actions.toggleConversationStatus.pending, (state, action) => {
        state.isChangingConversationStatus = true;
      })
      .addCase(actions.toggleConversationStatus.fulfilled, (state, { payload }) => {
        state.isChangingConversationStatus = false;
      })
      .addCase(actions.toggleConversationStatus.rejected, state => {
        state.isChangingConversationStatus = false;
      });
  },
});
export const conversationSelector = conversationAdapter.getSelectors(state => state.conversations);

export const selectConversationMeta = state => state.conversations.meta;
export const selectAllConversationFetched = state => state.conversations.isAllConversationsFetched;
export const selectConversationStatus = state => state.conversations.conversationStatus;
export const selectAssigneeType = state => state.conversations.assigneeType;
export const selectActiveInbox = state => state.conversations.currentInbox;
export const selectMessagesLoading = state => state.conversations.loadingMessages;
export const selectConversationFetching = state => state.conversations.isConversationFetching;
export const selectAllMessagesFetched = state => state.conversations.isAllMessagesFetched;
export const selectConversationToggleStatus = state =>
  state.conversations.isChangingConversationStatus;
export const selectConversationAssigneeStatus = state =>
  state.conversations.isChangingConversationAssignee;
export const selectors = {
  getFilteredConversations: createDraftSafeSelector(
    [conversationSelector.selectAll, (_, filters) => filters],
    (conversations, filters) => {
      const { assigneeType, userId } = filters;

      const sortedConversations = conversations.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
      if (assigneeType === 'mine') {
        return sortedConversations.filter(conversation => {
          const { assignee } = conversation.meta;
          const shouldFilter = applyFilters(conversation, filters);
          const isAssignedToMe = assignee && assignee.id === userId;
          const isChatMine = isAssignedToMe && shouldFilter;
          return isChatMine;
        });
      }
      if (assigneeType === 'unassigned') {
        return sortedConversations.filter(conversation => {
          const isUnAssigned = !conversation.meta.assignee;
          const shouldFilter = applyFilters(conversation, filters);
          return isUnAssigned && shouldFilter;
        });
      }

      return sortedConversations.filter(conversation => {
        const shouldFilter = applyFilters(conversation, filters);
        return shouldFilter;
      });
    },
  ),
  getMessagesByConversationId: createDraftSafeSelector(
    [conversationSelector.selectEntities, (_, conversationId) => conversationId],
    (conversations, conversationId) => {
      const conversation = conversations[conversationId];
      if (!conversation) {
        return [];
      }
      return conversation.messages;
    },
  ),
  getConversationById: createDraftSafeSelector(
    [conversationSelector.selectEntities, (_, conversationId) => conversationId],
    (conversations, conversationId) => {
      return conversations[conversationId];
    },
  ),
};
export const {
  clearAllConversations,
  clearConversation,
  setConversationStatus,
  setAssigneeType,
  setActiveInbox,
  addConversation,
  addMessage,
  updateConversation,
  updateContactsPresence,
} = conversationSlice.actions;

export default conversationSlice.reducer;
