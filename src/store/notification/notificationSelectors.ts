import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { notificationsAdapter } from './notificationSlice';

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
  notifications.filter(notification => !notification.read_at),
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
