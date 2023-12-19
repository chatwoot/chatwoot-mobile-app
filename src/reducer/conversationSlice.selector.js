import { createDraftSafeSelector } from '@reduxjs/toolkit';

import { CONVERSATION_PRIORITY_ORDER } from 'constants';
import { applyFilters } from '../helpers/conversationHelpers';
import { conversationSelector } from './conversationSlice';

export const selectors = {
  getFilteredConversations: createDraftSafeSelector(
    [conversationSelector.selectAll, (_, filters) => filters],
    (conversations, filters) => {
      const { assigneeType, userId, sortBy } = filters;
      const comparator = {
        latest: (a, b) => b.last_activity_at - a.last_activity_at,
        sort_on_created_at: (a, b) => a.created_at - b.created_at,
        sort_on_priority: (a, b) => {
          return CONVERSATION_PRIORITY_ORDER[a.priority] - CONVERSATION_PRIORITY_ORDER[b.priority];
        },
      };
      const sortedConversations = conversations.sort(comparator[sortBy]);

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

      const completeMessages = []
        .concat(conversation.messages)
        .sort((a, b) => a.created_at - b.created_at)
        .reverse();

      return completeMessages.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
    },
  ),
  getConversationById: createDraftSafeSelector(
    [conversationSelector.selectEntities, (_, conversationId) => conversationId],
    (conversations, conversationId) => {
      return conversations[conversationId];
    },
  ),
};
