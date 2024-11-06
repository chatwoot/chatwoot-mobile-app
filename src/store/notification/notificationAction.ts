import { createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationService } from './notificationService';
import type { NotificationResponse } from './notificationTypes';
import { handleApiError } from './notificationUtils';
import I18n from '@/i18n';

const createNotificationThunk = <TResponse, TPayload>(
  type: string,
  handler: (payload: TPayload) => Promise<TResponse>,
  errorMessage?: string,
) => {
  return createAsyncThunk<TResponse, TPayload>(type, async (payload, { rejectWithValue }) => {
    try {
      return await handler(payload);
    } catch (error) {
      return rejectWithValue(handleApiError(error, errorMessage));
    }
  });
};

export const notificationActions = {
  fetchNotifications: createNotificationThunk<NotificationResponse, { page: number }>(
    'notifications/fetchNotifications',
    async ({ page }) => NotificationService.getNotifications(page),
    I18n.t('ERRORS.NOTIFICATIONS_FETCH'),
  ),

  markAsRead: createNotificationThunk<void, { accountId: number; notificationId: number }>(
    'notifications/markAsRead',
    async ({ accountId, notificationId }) =>
      NotificationService.markAsRead(accountId, notificationId),
    I18n.t('ERRORS.NOTIFICATION_MARK_READ'),
  ),

  markAllAsRead: createNotificationThunk<void, number>(
    'notifications/markAllAsRead',
    async accountId => NotificationService.markAllAsRead(accountId),
    I18n.t('ERRORS.NOTIFICATIONS_MARK_READ'),
  ),
};
