import { createDraftSafeSelector, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { conversationAdapter } from './conversationSlice';
import { FilterState } from '@/store/conversation/conversationFilterSlice';
import { CONVERSATION_PRIORITY_ORDER } from '@/constants';
import { shouldApplyFilters } from '@/utils/conversationUtils';
import type { Conversation } from '@/types';
import { MESSAGE_TYPES } from '@/constants';

export const selectConversationsState = (state: RootState) => state.conversations;

export const {
  selectAll: selectAllConversations,
  selectById: selectConversationById,
  selectIds: selectConversationIds,
} = conversationAdapter.getSelectors<RootState>(selectConversationsState);

export const selectConversationsLoading = createSelector(
  selectConversationsState,
  state => state.isLoadingConversations,
);

export const selectIsAllConversationsFetched = createSelector(
  selectConversationsState,
  state => state.isAllConversationsFetched,
);

export const selectIsAllMessagesFetched = createSelector(
  selectConversationsState,
  state => state.isAllMessagesFetched,
);

export const selectIsLoadingMessages = createSelector(
  selectConversationsState,
  state => state.isLoadingMessages,
);

export const getFilteredConversations = createDraftSafeSelector(
  [
    selectAllConversations,
    (_, filters: FilterState) => filters,
    (_, __, userId: number | undefined) => userId,
  ],
  (conversations, filters, userId) => {
    const { assignee_type: assigneeType, sort_by: sortBy } = filters;
    let sortType = filters.sort_by; // Create mutable variable

    type SortComparator = {
      latest: (a: Conversation, b: Conversation) => number;
      sort_on_created_at: (a: Conversation, b: Conversation) => number;
      sort_on_priority: (a: Conversation, b: Conversation) => number;
    };

    const comparator: SortComparator = {
      latest: (a, b) => b.lastActivityAt - a.lastActivityAt,
      sort_on_created_at: (a, b) => a.createdAt - b.createdAt,
      sort_on_priority: (a, b) => {
        const priorityA = a.priority || 'low';
        const priorityB = b.priority || 'low';
        return CONVERSATION_PRIORITY_ORDER[priorityA] - CONVERSATION_PRIORITY_ORDER[priorityB];
      },
    };

    // Type guard to ensure sortBy is a valid key of comparator
    const isValidSortBy = (sort: string): sort is keyof SortComparator => {
      return sort in comparator;
    };

    if (!isValidSortBy(sortBy)) {
      // Default to 'latest' if invalid sortBy
      sortType = 'latest';
    }

    const sortedConversations = conversations.sort(comparator[sortType as keyof SortComparator]);

    if (assigneeType === 'me') {
      return sortedConversations.filter(conversation => {
        const { assignee } = conversation.meta;

        const shouldFilter = shouldApplyFilters(conversation, filters);
        const isAssignedToMe = assignee && assignee.id === userId;
        const isChatMine = isAssignedToMe && shouldFilter;
        return isChatMine;
      });
    }
    if (assigneeType === 'unassigned') {
      return sortedConversations.filter(conversation => {
        const isUnAssigned = !conversation.meta.assignee;
        const shouldFilter = shouldApplyFilters(conversation, filters);
        return isUnAssigned && shouldFilter;
      });
    }

    return sortedConversations.filter(conversation => {
      const shouldFilter = shouldApplyFilters(conversation, filters);
      return shouldFilter;
    });
  },
);

export const getMessagesByConversationId = createDraftSafeSelector(
  [
    (state: RootState, params: { conversationId: number }) =>
      selectConversationById(state, params.conversationId),
  ],
  conversation => {
    if (!conversation) {
      return [];
    }
    // Memoize the sorted and filtered messages using createSelector
    return conversation.messages
      .slice()
      .sort((a, b) => a.createdAt - b.createdAt)
      .reverse()
      .filter((message, index, self) => index === self.findIndex(m => m.id === message.id));
  },
);

export const getLastEmailInSelectedChat = createDraftSafeSelector(
  [
    (state: RootState, params: { conversationId: number }) =>
      selectConversationById(state, params.conversationId),
  ],
  conversation => {
    if (!conversation) {
      return [];
    }
    const lastEmail = [...conversation.messages].reverse().find(message => {
      const { contentAttributes = {}, messageType } = message;
      const { email = {} } = contentAttributes || {};
      const isIncomingOrOutgoing =
        messageType === MESSAGE_TYPES.OUTGOING || messageType === MESSAGE_TYPES.INCOMING;
      if (email.from && isIncomingOrOutgoing) {
        return true;
      }
      return false;
    });
    return lastEmail;
  },
);
