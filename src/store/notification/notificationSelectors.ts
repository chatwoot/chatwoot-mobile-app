import { createDraftSafeSelector, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { notificationsAdapter } from './notificationSlice';
import { FilterState, SortTypes } from './notificationFilterSlice';
import { Notification } from '@/types/Notification';
export const selectNotificationsState = (state: RootState) => state.notifications;

export const {
  selectAll: selectAllNotifications,
  selectById: selectNotificationById,
  selectIds: selectNotificationIds,
} = notificationsAdapter.getSelectors<RootState>(selectNotificationsState);

export const selectNotificationsMetadata = createSelector(selectNotificationsState, state => ({
  unreadCount: state.unreadCount,
  totalCount: state.totalCount,
  currentPage: state.currentPage,
  isLoading: state.uiFlags.isLoading,
  error: state.error,
}));

export const selectUnreadNotifications = createSelector(selectAllNotifications, notifications =>
  notifications.filter(notification => !notification.readAt),
);

export const selectIsLoadingNotifications = createSelector(
  selectNotificationsState,
  state => state.uiFlags.isLoading,
);

export const selectNotificationsError = createSelector(
  selectNotificationsState,
  state => state.error,
);

export const selectNotificationsCurrentPage = createSelector(
  selectNotificationsState,
  state => state.currentPage,
);

export const selectIsAllNotificationsFetched = createSelector(
  selectNotificationsState,
  state => state.uiFlags.isAllNotificationsFetched,
);

export const getFilteredNotifications = createDraftSafeSelector(
  [selectAllNotifications, (_, filters: FilterState) => filters], // Receber FilterState
  (notifications, filters) => {
    const { sortOrder, search_text: searchText } = filters; // Desestruturar sortOrder e searchText
    type SortComparator = {
      asc: (a: Notification, b: Notification) => number;
      desc: (a: Notification, b: Notification) => number;
    };
    const comparator: SortComparator = {
      asc: (a, b) => a.createdAt - b.createdAt,
      desc: (a, b) => b.createdAt - a.createdAt,
    };

    let filteredNotifications = notifications;

    if (searchText) {
      const lowerCaseSearchText = searchText.toLowerCase();
      filteredNotifications = notifications.filter(notification => {
        const pushMessageTitle = notification.pushMessageTitle?.toLowerCase() || '';

        return pushMessageTitle.includes(lowerCaseSearchText) || notification?.secondaryActor?.sender?.phoneNumber.toLowerCase().includes(lowerCaseSearchText) || 
        notification?.secondaryActor?.sender?.name.toLowerCase().includes(lowerCaseSearchText);
      });
    }

    return filteredNotifications.sort(comparator[sortOrder as SortTypes]); // Aplicar sort no resultado da busca
  },
);
