import reducer from '../notificationSlice';
import { notificationActions } from '../notificationAction';
import type { MarkAsReadPayload } from '../notificationTypes';
import type { Notification } from '@/types/Notification';
import { updateBadgeCount } from '@/utils/pushUtils';

jest.mock('@/utils/pushUtils', () => ({
  updateBadgeCount: jest.fn(),
}));

const buildNotification = (overrides: Partial<Notification> = {}): Notification =>
  ({
    id: 1,
    notificationType: 'conversation_assignment',
    primaryActorType: 'Conversation',
    primaryActorId: 10,
    readAt: null,
    createdAt: 1,
    lastActivityAt: 1,
    ...overrides,
  }) as unknown as Notification;

const buildState = (notifications: Notification[], unreadCount: number) => {
  const state = reducer(undefined, { type: 'unknown' });
  return {
    ...state,
    ids: notifications.map(notification => notification.id),
    entities: Object.fromEntries(
      notifications.map(notification => [notification.id, notification]),
    ),
    unreadCount,
  };
};

const markAsRead = (payload: MarkAsReadPayload) =>
  notificationActions.markAsRead.fulfilled(payload, 'request-id', payload);

describe('notification reducer', () => {
  describe('markAsRead', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('marks the notification read and lowers the unread count', () => {
      const state = buildState(
        [buildNotification(), buildNotification({ id: 2, primaryActorId: 20 })],
        2,
      );

      const nextState = reducer(
        state,
        markAsRead({ primaryActorId: 10, primaryActorType: 'Conversation' }),
      );

      expect(nextState.entities[1]?.readAt).toBeTruthy();
      expect(nextState.entities[2]?.readAt).toBeNull();
      expect(nextState.unreadCount).toBe(1);
      expect(updateBadgeCount).toHaveBeenCalledWith({ count: 1 });
    });

    it('keeps the unread count when the notification was already read', () => {
      const state = buildState(
        [
          buildNotification({ readAt: '2026-01-01T00:00:00.000Z' }),
          buildNotification({ id: 2, primaryActorId: 20 }),
        ],
        1,
      );

      const nextState = reducer(
        state,
        markAsRead({ primaryActorId: 10, primaryActorType: 'Conversation' }),
      );

      expect(nextState.unreadCount).toBe(1);
      expect(updateBadgeCount).not.toHaveBeenCalled();
    });

    it('marks every unread notification of the conversation read, as the server does', () => {
      const state = buildState(
        [
          buildNotification(),
          buildNotification({ id: 2, notificationType: 'conversation_mention' }),
          buildNotification({ id: 3, primaryActorId: 20 }),
        ],
        3,
      );

      const nextState = reducer(
        state,
        markAsRead({ primaryActorId: 10, primaryActorType: 'Conversation' }),
      );

      expect(nextState.entities[1]?.readAt).toBeTruthy();
      expect(nextState.entities[2]?.readAt).toBeTruthy();
      expect(nextState.entities[3]?.readAt).toBeNull();
      expect(nextState.unreadCount).toBe(1);
    });
  });
});
