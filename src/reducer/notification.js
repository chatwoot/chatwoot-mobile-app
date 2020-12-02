import {
  GET_NOTIFICATION,
  GET_NOTIFICATION_SUCCESS,
  GET_NOTIFICATION_ERROR,
  ALL_NOTIFICATIONS_LOADED,
  UPDATE_ALL_NOTIFICATIONS,
  SET_PUSH_TOKEN,
  ADD_NOTIFICATION,
} from '../constants/actions';

const initialState = {
  isFetching: false,
  isAllNotificationsLoaded: false,
  data: {
    meta: { unread_count: 0 },
    payload: [],
  },
  pushToken: null,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_PUSH_TOKEN:
      return { ...state, pushToken: action.payload };

    case GET_NOTIFICATION: {
      return {
        ...state,
        isAllNotificationsLoaded: false,
        isFetching: true,
        data: {
          meta: {},
          payload: [],
        },
      };
    }

    case GET_NOTIFICATION_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: {
          meta: action.payload.meta,
          payload: [...state.data.payload, ...action.payload.notifications],
        },
      };
    }

    case ALL_NOTIFICATIONS_LOADED: {
      return {
        ...state,
        isAllNotificationsLoaded: true,
        isFetching: false,
      };
    }

    case ADD_NOTIFICATION: {
      return {
        ...state,
        data: {
          meta: state.data.meta,
          payload: [action.payload, ...state.data.payload],
        },
      };
    }

    case UPDATE_ALL_NOTIFICATIONS: {
      return {
        ...state,
        data: {
          meta: action.payload.meta,
          payload: action.payload.notifications,
        },
      };
    }

    case GET_NOTIFICATION_ERROR: {
      return {
        ...initialState,
        isFetching: false,
      };
    }

    default:
      return state;
  }
};
