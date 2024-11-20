import { createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationService } from './notificationService';
import type {
  NotificationResponse,
  MarkAsReadPayload,
  ApiErrorResponse,
  NotificationPayload,
} from './notificationTypes';
import { transformNotification, transformNotificationMeta } from '@/utils/camelcaseKeys';
import { AxiosError } from 'axios';

export const notificationActions = {
  fetchNotifications: createAsyncThunk<NotificationResponse, NotificationPayload>(
    'notifications/fetchNotifications',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await NotificationService.getNotifications(payload);
        const { payload: notifications, meta } = response.data;
        const transformedResponse: NotificationResponse = {
          notifications: notifications.map(transformNotification),
          meta: transformNotificationMeta(meta),
        };
        return transformedResponse;
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ), 
  markAsRead: createAsyncThunk<MarkAsReadPayload, MarkAsReadPayload>(
    'notifications/markAsRead',
    async (payload, { rejectWithValue }) => {
      try {
        await NotificationService.markAsRead(payload);
        return payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  markAllAsRead: createAsyncThunk<void, void>(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
      try {
        await NotificationService.markAllAsRead();
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
