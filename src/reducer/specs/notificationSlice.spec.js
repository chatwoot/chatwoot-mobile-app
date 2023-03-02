import notificationSlice, {
  notificationSelector,
  selectIsFetching,
  selectUnreadCount,
  selectPushToken,
  actions as notificationActions,
} from '../notificationSlice';

const notifications = [
  {
    id: 1,
    notification_type: 'conversation_mention',
    primary_actor_id: 3975,
    primary_actor_type: 'Conversation',
    push_message_title: '[#3550] @Joy',
    read_at: null,
  },
  {
    id: 2,
    notification_type: 'conversation_created',
    primary_actor_id: 2323,
    primary_actor_type: 'Conversation',
    push_message_title: 'New conversation created',
    read_at: null,
  },
];

jest.mock('axios');

jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: {
          payload: {
            notifications: notifications,
            meta: {
              unread_count: 2,
            },
          },
        },
      });
    }),
  };
});
jest.mock('helpers/AuthHelper', () => {
  return {
    getHeaders: jest.fn(() => {
      return {
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }),
  };
});

jest.mock('helpers/UrlHelper', () => {
  return {
    getBaseUrl: jest.fn(() => {
      return 'http://localhost:3000';
    }),
  };
});

describe('notificationSlice', () => {
  describe('reducers', () => {
    const initialState = {
      entities: {},
      ids: [],
      uiFlags: {
        loading: false,
        isAllNotificationsLoaded: false,
      },
      meta: {
        unread_count: 0,
      },
    };

    it('sets loading true when fetch all notifications is pending', () => {
      const action = { type: notificationActions.index.pending };
      const state = notificationSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: true, isAllNotificationsLoaded: false },
        entities: {},
        ids: [],
        meta: {
          unread_count: 0,
        },
      });
    });

    it('sets loading false when fetch all notifications is rejected', () => {
      const action = { type: notificationActions.index.rejected };
      const state = notificationSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false, isAllNotificationsLoaded: false },
        entities: {},
        ids: [],
        meta: {
          unread_count: 0,
        },
      });
    });

    it('sets notifications when fetch all notifications is fulfilled', () => {
      const action = {
        type: notificationActions.index.fulfilled,
        payload: {
          notifications: notifications,
          meta: {
            unread_count: 2,
          },
        },
      };
      const state = notificationSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false, isAllNotificationsLoaded: true },
        entities: {
          1: notifications[0],
          2: notifications[1],
        },
        ids: [1, 2],
        meta: {
          unread_count: 2,
        },
      });
    });

    it('sets loading false when mark notification as read is fulfilled', () => {
      const initialStateWithData = {
        entities: {
          1: notifications[0],
        },
        ids: [1],
        uiFlags: {
          loading: false,
          isAllNotificationsLoaded: false,
        },
        meta: {
          unread_count: 1,
        },
      };

      const action = {
        type: notificationActions.markNotificationAsRead.fulfilled,
        payload: notifications[0],
      };
      const state = notificationSlice(initialStateWithData, action);
      expect(state).toEqual({
        uiFlags: { loading: false, isAllNotificationsLoaded: false },
        entities: {
          1: notifications[0],
        },
        ids: [1],
        meta: {
          unread_count: 0,
        },
      });
    });
  });

  describe('selectors', () => {
    const initialState = {
      entities: {
        1: notifications[0],
        2: notifications[1],
      },
      ids: [1, 2],
      uiFlags: {
        loading: false,
        isAllNotificationsLoaded: true,
      },
      meta: {
        unread_count: 2,
      },
      pushToken: 'ASDFGHJKL',
    };

    it('returns all notifications', () => {
      const state = { notifications: initialState };
      expect(notificationSelector.selectAll(state)).toEqual(notifications);
    });

    it('returns isFetching', () => {
      const state = { notifications: initialState };
      expect(selectIsFetching(state)).toEqual(false);
    });

    it('returns unread count', () => {
      const state = { notifications: initialState };
      expect(selectUnreadCount(state)).toEqual(2);
    });

    it('returns push token', () => {
      const state = { notifications: initialState };
      expect(selectPushToken(state)).toEqual('ASDFGHJKL');
    });
  });
});
