import type { RootState } from '@/store';
import type { ChatListTab } from './chatListTypes';

export const selectChatListState = (state: RootState) => state.chatList;

export const selectChatListCards = (tab: ChatListTab) => (state: RootState) =>
  state.chatList.cards[tab];

export const selectChatListTotal = (tab: ChatListTab) => (state: RootState) =>
  state.chatList.total[tab];

export const selectChatListPage = (tab: ChatListTab) => (state: RootState) =>
  state.chatList.page[tab];

export const selectChatListIsLoading = (state: RootState) => state.chatList.isLoading;

export const selectChatListIsLoadingMore = (state: RootState) => state.chatList.isLoadingMore;

export const selectChatListBadgeCounters = (state: RootState) => state.chatList.badgeCounters;
