import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import type {
  NotificationCreatedResponse,
  NotificationResponse,
  NotificationRemovedResponse,
  MarkAsReadPayload,
} from './notificationTypes';
import { Notification } from '@/types/Notification';
import { notificationActions } from './notificationAction';
import { updateBadgeCount } from '@/helpers/PushHelper';

export interface NotificationState {
  unreadCount: number;
  totalCount: number;
  currentPage: string;
  error: string | null;
  uiFlags: {
    isLoading: boolean;
    isAllNotificationsRead: boolean;
  };
}

export const notificationsAdapter = createEntityAdapter<Notification>({
  sortComparer: (a, b) => b.lastActivityAt - a.lastActivityAt,
});

const initialState = notificationsAdapter.getInitialState<NotificationState>({
  unreadCount: 0,
  totalCount: 0,
  currentPage: '1',
  error: null,
  uiFlags: {
    isLoading: false,
    isAllNotificationsRead: false,
  },
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications: state => {
      notificationsAdapter.removeAll(state);
      state.unreadCount = 0;
      state.totalCount = 0;
      state.currentPage = '1';
      state.error = null;
    },
    addNotification(state, action: PayloadAction<NotificationCreatedResponse>) {
      const { notification, unread_count } = action.payload;
      notificationsAdapter.addOne(state, notification);
      state.unreadCount = unread_count;
      updateBadgeCount({ count: unread_count });
    },
    removeNotification(state, action: PayloadAction<NotificationRemovedResponse>) {
      const { notification, unread_count } = action.payload;
      notificationsAdapter.removeOne(state, notification.id);
      state.unreadCount = unread_count;
      updateBadgeCount({ count: unread_count });
    },
  },
  extraReducers: builder => {
    builder
      // Fetch notifications
      .addCase(notificationActions.fetchNotifications.pending, state => {
        state.uiFlags.isLoading = true;
        state.error = null;
      })
      .addCase(
        notificationActions.fetchNotifications.fulfilled,
        (state, action: PayloadAction<NotificationResponse>) => {
          const { notifications, meta } = action.payload;
          state.unreadCount = meta.unreadCount;
          state.totalCount = meta.count;
          state.currentPage = meta.currentPage;
          state.uiFlags.isLoading = false;
          updateBadgeCount({ count: meta.unreadCount });
          if (meta.currentPage === '1') {
            notificationsAdapter.setAll(state, notifications);
          } else {
            notificationsAdapter.upsertMany(state, notifications);
          }
          state.uiFlags.isAllNotificationsRead = notifications.length < 15;
        },
      )
      .addCase(notificationActions.fetchNotifications.rejected, (state, action) => {
        state.uiFlags.isLoading = false;
        state.uiFlags.isAllNotificationsRead = true;
        state.error = (action.payload as string) ?? 'Failed to fetch notifications';
      })
      .addCase(
        notificationActions.markAsRead.fulfilled,
        (state, action: PayloadAction<MarkAsReadPayload>) => {
          const { primary_actor_id: primaryActorId } = action.payload;
          const notification = Object.values(state.entities).find(
            n => n?.primaryActorId === primaryActorId,
          );
          if (notification) {
            notificationsAdapter.updateOne(state, {
              id: primaryActorId,
              changes: { readAt: new Date().toISOString() },
            });
            state.unreadCount = state.unreadCount > 0 ? state.unreadCount - 1 : 0;
            updateBadgeCount({ count: state.unreadCount });
          }
        },
      )
      .addCase(notificationActions.markAllAsRead.fulfilled, state => {
        state.unreadCount = 0;
        updateBadgeCount({ count: 0 });
      });
  },
});

export const { resetNotifications, addNotification, removeNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
