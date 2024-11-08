import type { Conversation } from '@/types';
import type { FilterState } from '@/store/conversation/conversationFilterSlice';

const filterByStatus = (chatStatus: string, filterStatus: string) =>
  filterStatus === 'all' ? true : chatStatus === filterStatus;

export const shouldApplyFilters = (conversation: Conversation, filters: FilterState) => {
  const { inbox_id: inboxId, status } = filters;
  const { status: chatStatus, inbox_id: chatInboxId } = conversation;
  let shouldFilter = filterByStatus(chatStatus, status);
  if (inboxId) {
    const filterByInbox = Number(inboxId) === chatInboxId;
    shouldFilter = shouldFilter && filterByInbox;
  }

  return shouldFilter;
};
