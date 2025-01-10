import { createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationService } from './notificationService';
import type {
  NotificationResponse,
  MarkAsReadPayload,
  ApiErrorResponse,
  InboxSortTypes,
} from './notificationTypes';
import { AxiosError } from 'axios';

export const notificationActions = {
  fetchNotifications: createAsyncThunk<
    NotificationResponse,
    { page: number; sort_order: InboxSortTypes }
  >('notifications/fetchNotifications', async (payload, { rejectWithValue }) => {
    try {
      return await NotificationService.getNotifications(payload.page, payload.sort_order);
    } catch (error) {
      const { response } = error as AxiosError<ApiErrorResponse>;
      if (!response) {
        throw error;
      }
      return rejectWithValue(response.data);
    }
  }),

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
        return rejectWithValue(error);
      }
    },
  ),

  markAsUnread: createAsyncThunk<number, number>(
    'notifications/markAsUnread',
    async (notificationId, { rejectWithValue }) => {
      try {
        await NotificationService.markAsUnread(notificationId);
        return notificationId;
      } catch (error) {
        return rejectWithValue(error);
      }
    },
  ),
  delete: createAsyncThunk<number, number>(
    'notifications/delete',
    async (notificationId, { rejectWithValue }) => {
      try {
        await NotificationService.delete(notificationId);
        return notificationId;
      } catch (error) {
        return rejectWithValue(error);
      }
    },
  ),
};
