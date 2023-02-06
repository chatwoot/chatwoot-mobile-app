import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import {
  getUniqueId,
  getSystemName,
  getManufacturer,
  getModel,
  getApiLevel,
  getBrand,
  getBuildNumber,
} from 'react-native-device-info';
import APIHelper from '../helpers/APIHelper';
import { updateBadgeCount } from 'helpers/PushHelper';

import { getHeaders } from 'helpers/AuthHelper';
import { getBaseUrl } from 'helpers/UrlHelper';
import { API_URL } from 'constants/url';

export const notificationAdapter = createEntityAdapter({
  selectId: notification => notification.id,
});

export const actions = {
  getAllNotifications: createAsyncThunk(
    'notifications/getAllNotifications',
    async ({ pageNo = 1 }, { rejectWithValue }) => {
      try {
        const response = await APIHelper.get(`notifications?page=${pageNo}`);
        const {
          data: { payload, meta },
        } = response.data;
        const { unread_count } = meta;
        updateBadgeCount({ count: unread_count });
        return {
          notifications: payload,
          meta,
        };
      } catch (error) {
        return rejectWithValue(error);
      }
    },
  ),
  markNotificationAsRead: createAsyncThunk(
    'notifications/markNotificationAsRead',
    async ({ primaryActorId, primaryActorType }, { getState, rejectWithValue }) => {
      try {
        const {
          meta: { unread_count },
        } = getState().notifications;
        const apiUrl = 'notifications/read_all';
        const unreadCount = unread_count ? unread_count - 1 : 0;
        await APIHelper.post(apiUrl, {
          primary_actor_type: primaryActorType,
          primary_actor_id: primaryActorId,
        });
        updateBadgeCount({ count: unreadCount });
        return {
          primaryActorId,
        };
      } catch (error) {
        return rejectWithValue(error);
      }
    },
  ),
  markAllNotificationAsRead: createAsyncThunk(
    'notifications/markAllNotificationAsRead',
    async (_, { rejectWithValue }) => {
      try {
        const apiUrl = 'notifications/read_all';
        await APIHelper.post(apiUrl);
        updateBadgeCount({ count: 0 });
        return {};
      } catch (error) {
        return rejectWithValue(error);
      }
    },
  ),
  saveDeviceDetails: createAsyncThunk(
    'notifications/saveDeviceDetails',
    async (_, { rejectWithValue }) => {
      try {
        const permissionEnabled = await messaging().hasPermission();

        if (!permissionEnabled || permissionEnabled === -1) {
          await messaging().requestPermission();
        }
        const fcmToken = await messaging().getToken();

        const deviceId = getUniqueId();
        const devicePlatform = getSystemName();
        const manufacturer = await getManufacturer();
        const model = await getModel();
        const apiLevel = await getApiLevel();
        const deviceName = `${manufacturer} ${model}`;
        const brandName = await getBrand();
        const buildNumber = await getBuildNumber();
        const pushData = {
          subscription_type: 'fcm',
          subscription_attributes: {
            deviceName,
            devicePlatform,
            apiLevel,
            brandName,
            buildNumber,
            push_token: fcmToken,
            device_id: deviceId,
          },
        };
        const headers = await getHeaders();
        const baseURL = await getBaseUrl();
        await axios.post(`${baseURL}${API_URL}notification_subscriptions`, pushData, {
          headers: headers,
        });
        return { fcmToken };
      } catch (error) {
        return rejectWithValue(error);
      }
    },
  ),
  // TODO: Use on logout
  clearDeviceDetails: createAsyncThunk(
    'notifications/clearDeviceDetails',
    async ({ pushToken }, { rejectWithValue }) => {
      try {
        const headers = await getHeaders();
        const baseURL = await getBaseUrl();
        const data = { push_token: pushToken };
        await axios({
          method: 'DELETE',
          url: `${baseURL}${API_URL}notification_subscriptions`,
          data: data,
          headers: headers,
        });
        return {};
      } catch (error) {
        return rejectWithValue(error);
      }
    },
  ),
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: notificationAdapter.getInitialState({
    loading: false,
    meta: {
      unread_count: 0,
    },
    isAllNotificationsLoaded: false,
    isFetching: false,
    pushToken: null,
  }),
  reducers: {},
  extraReducers: {
    [actions.getAllNotifications.pending]: state => {
      state.loading = true;
    },
    [actions.getAllNotifications.fulfilled]: (state, action) => {
      state.loading = false;
      state.meta = action.payload.meta;
      notificationAdapter.upsertMany(state, action.payload.notifications);
      state.isAllNotificationsLoaded = action.payload.notifications.length < 15;
    },
    [actions.getAllNotifications.rejected]: state => {
      state.loading = false;
    },
    [actions.markNotificationAsRead.fulfilled]: (state, action) => {
      const { primaryActorId } = action.payload;
      const notification = state.entities[primaryActorId];
      if (notification) {
        notification.read_at = 'read_at';
      }
      state.meta.unread_count = state.meta.unread_count ? state.meta.unread_count - 1 : 0;
    },
    [actions.markAllNotificationAsRead.fulfilled]: (state, action) => {
      state.meta.unread_count = 0;
      Object.keys(state.entities).forEach(key => {
        state.entities[key].read_at = 'read_at';
      });
    },
    [actions.saveDeviceDetails.fulfilled]: (state, action) => {
      state.pushToken = action.payload.fcmToken;
    },
    [actions.clearDeviceDetails.fulfilled]: state => {
      state.pushToken = null;
    },
  },
});

export const notificationSelector = notificationAdapter.getSelectors(state => state.notifications);

export const selectAllNotificationsLoaded = state => state.notifications.isAllNotificationsLoaded;

export const selectIsFetching = state => state.notifications.isFetching;

export const selectUnreadCount = state => state.notifications.meta.unread_count;

export const selectPushToken = state => state.notifications.pushToken;

export default notificationSlice.reducer;
