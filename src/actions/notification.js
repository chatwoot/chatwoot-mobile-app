import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  getUniqueId,
  getSystemName,
  getManufacturer,
  getModel,
  getApiLevel,
  getBrand,
  getBuildNumber,
} from 'react-native-device-info';
import axios from 'axios';

import { getHeaders } from '../helpers/AuthHelper';
import { getBaseUrl } from '../helpers/UrlHelper';
import { API_URL } from '../constants/url';
import {
  SET_PUSH_TOKEN,
  ALL_NOTIFICATIONS_LOADED,
  UPDATE_ALL_NOTIFICATIONS,
  ADD_NOTIFICATION,
} from '../constants/actions';
import APIHelper from '../helpers/APIHelper';

import { updateBadgeCount } from '../helpers/PushHelper';

import {
  GET_NOTIFICATION,
  GET_NOTIFICATION_SUCCESS,
  GET_NOTIFICATION_ERROR,
} from '../constants/actions';

export const getAllNotifications =
  ({ pageNo = 1 }) =>
  async dispatch => {
    try {
      if (pageNo === 1) {
        dispatch({ type: GET_NOTIFICATION });
      }

      const response = await APIHelper.get(`notifications?page=${pageNo}`);
      const {
        data: { payload, meta },
      } = response.data;

      const updatedPayload = payload.sort((a, b) => {
        return b.created_at - a.created_at;
      });
      const { unread_count } = meta;
      updateBadgeCount({ count: unread_count });

      dispatch({
        type: GET_NOTIFICATION_SUCCESS,
        payload: {
          notifications: updatedPayload,
          meta,
        },
      });

      if (payload.length < 25) {
        dispatch({
          type: ALL_NOTIFICATIONS_LOADED,
        });
      }
    } catch (error) {
      dispatch({ type: GET_NOTIFICATION_ERROR, payload: error });
    }
  };

export const markNotificationAsRead =
  ({ primaryActorId, primaryActorType }) =>
  async (dispatch, getState) => {
    const {
      data: { payload, meta },
    } = getState().notification;
    try {
      const apiUrl = 'notifications/read_all';
      await APIHelper.post(apiUrl, {
        primary_actor_type: primaryActorType,
        primary_actor_id: primaryActorId,
      });

      const updatedNotifications = payload.map((item, index) => {
        if (item.primary_actor_id === primaryActorId) {
          item.read_at = 'read_at';
          item.mass = 'mass';
        }
        return item;
      });

      const { unread_count } = meta;

      const updatedUnReadCount = unread_count ? unread_count - 1 : unread_count;

      updateBadgeCount({ count: updatedUnReadCount });

      dispatch({
        type: UPDATE_ALL_NOTIFICATIONS,
        payload: {
          notifications: updatedNotifications,
          meta: { unread_count: updatedUnReadCount },
        },
      });
    } catch {}
  };

export const markAllNotificationAsRead = () => async (dispatch, getState) => {
  const {
    data: { payload },
  } = getState().notification;

  try {
    const apiUrl = 'notifications/read_all';
    await APIHelper.post(apiUrl);
    const updatedNotifications = payload.map((item, index) => {
      item.read_at = 'read_at';
      return item;
    });
    updateBadgeCount({ count: 0 });
    dispatch({
      type: UPDATE_ALL_NOTIFICATIONS,
      payload: {
        notifications: updatedNotifications,
        meta: { unread_count: 0 },
      },
    });
  } catch (error) {}
};

export const saveDeviceDetails = () => async dispatch => {
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

    dispatch({ type: SET_PUSH_TOKEN, payload: fcmToken });
  } catch (err) {}
};

export const addNotification =
  ({ notification }) =>
  async (dispatch, getState) => {
    const {
      data: { payload },
    } = getState().notification;

    // Check notification is already exists or not
    const [notificationExists] = payload.filter(c => c.id === notification.id);

    if (notificationExists) {
      return;
    }
    dispatch({ type: ADD_NOTIFICATION, payload: notification });
  };
