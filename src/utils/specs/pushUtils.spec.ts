import { Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { transformNotification } from '../camelCaseKeys';
import {
  findConversationLinkFromPush,
  findNotificationFromFCM,
  ensureAndroidNotificationChannel,
  updateBadgeCount,
  ANDROID_NOTIFICATION_CHANNEL_ID,
} from '../pushUtils';

// [conomni] m9: локальный factory-мок вместо общего __mocks__/@notifee/react-native.js —
// тот повторяет паттерн из документации notifee (jest.mock(() => require('.../jest-mock')),
// но реальный jest-mock.js — ESM-исходник вне allowlist transformIgnorePatterns jest-expo,
// поэтому падает с SyntaxError, как только его фактически резолвят (что раньше не
// происходило: notifee грузился только под iOS и ни один тест не проверял вызовы к нему).
// Простой инлайн-мок здесь не трогает общую инфраструктуру и не требует правки jest.config.js.
// jest.mock(...) хойстится babel-plugin-jest-hoist выше импортов независимо от места в файле.
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(),
    setBadgeCount: jest.fn(),
    cancelAllNotifications: jest.fn(),
  },
  AndroidImportance: { HIGH: 4 },
}));

describe('findNotificationFromFCM', () => {
  it('should return notification from FCM HTTP v1 message', () => {
    const message = {
      data: {
        payload: '{"data": {"notification": {"id": 123, "title": "Test Notification"}}}',
      },
    };
    const result = findNotificationFromFCM({ message });
    expect(result).toEqual({ id: 123, title: 'Test Notification' });
  });

  it('should return notification from FCM legacy message', () => {
    const message = {
      data: {
        notification: '{"id": 456, "title": "Legacy Notification"}',
      },
    };
    const result = findNotificationFromFCM({ message });
    expect(result).toEqual({ id: 456, title: 'Legacy Notification' });
  });
});

describe('findConversationLinkFromPush', () => {
  it('should return conversation link if notification_type is conversation_creation', () => {
    const notification = {
      id: 8687,
      notificationType: 'conversation_creation',
      primaryActorId: 14902,
      primaryActorType: 'Conversation',
      primaryActor: { id: 14428 },
    };
    const installationUrl = 'https://app.chatwoot.com';
    const transformedNotification = transformNotification(notification);
    const result = findConversationLinkFromPush({
      notification: transformedNotification,
      installationUrl,
    });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/14428/14902/Conversation',
    );
  });

  it('should return conversation link if notification_type is assigned_conversation_new_message', () => {
    const notification = {
      id: 8694,
      notificationType: 'assigned_conversation_new_message',
      primaryActorId: 58731,
      primaryActorType: 'Message',
      primaryActor: { conversationId: 14429, id: 58731 },
    };
    const installationUrl = 'https://app.chatwoot.com';
    const transformedNotification = transformNotification(notification);
    const result = findConversationLinkFromPush({
      notification: transformedNotification,
      installationUrl,
    });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/14429/58731/Message',
    );
  });

  it('should return conversation link if notification_type is conversation_mention', () => {
    const notification = {
      id: 8690,
      notificationType: 'conversation_mention',
      primaryActorId: 58725,
      primaryActorType: 'Message',
      primaryActor: { conversationId: 14428, id: 58725 },
    };
    const installationUrl = 'https://app.chatwoot.com';
    const transformedNotification = transformNotification(notification);
    const result = findConversationLinkFromPush({
      notification: transformedNotification,
      installationUrl,
    });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/14428/58725/Message',
    );
  });

  it('should return conversation link if notification_type is participating_conversation_new_message', () => {
    const notification = {
      id: 8678,
      notificationType: 'participating_conversation_new_message',
      primaryActorId: 58712,
      primaryActorType: 'Message',
      primaryActor: { conversationId: 14427, id: 58712 },
    };
    const installationUrl = 'https://app.chatwoot.com';
    const transformedNotification = transformNotification(notification);
    const result = findConversationLinkFromPush({
      notification: transformedNotification,
      installationUrl,
    });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/14427/58712/Message',
    );
  });

  it('should return nothing if notification_type is not valid', () => {
    const notification = {
      id: 8678,
      notificationType: 'participating_conversation_message',
      primaryActorId: 58712,
      primaryActorType: 'Message',
      primaryActor: { conversationId: 14427, id: 58712 },
    };
    const installationUrl = 'https://app.chatwoot.com';
    const transformedNotification = transformNotification(notification);
    const result = findConversationLinkFromPush({
      notification: transformedNotification,
      installationUrl,
    });
    expect(result).toBe(undefined);
  });
});

// [conomni] m9: свой канал уведомлений Android с высокой важностью, звуком, вибрацией
// и бейджем — без него FCM рисует пуш в fcm_fallback_notification_channel, который MIUI
// и подобные оболочки считают неважным (не всплывает, без звука). См. with-android-notifications.js
// для manifest-части (id канала должен совпадать с ANDROID_NOTIFICATION_CHANNEL_ID).
describe('ensureAndroidNotificationChannel', () => {
  const originalPlatformOS = Platform.OS;

  afterEach(() => {
    jest.clearAllMocks();
    Platform.OS = originalPlatformOS;
  });

  it('creates a high-importance channel with sound, vibration and badge on Android', async () => {
    Platform.OS = 'android';
    await ensureAndroidNotificationChannel();
    expect(notifee.createChannel).toHaveBeenCalledWith({
      id: ANDROID_NOTIFICATION_CHANNEL_ID,
      name: 'Сообщения',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      badge: true,
    });
  });

  it('does nothing on iOS (channel is Android-only)', async () => {
    Platform.OS = 'ios';
    await ensureAndroidNotificationChannel();
    expect(notifee.createChannel).not.toHaveBeenCalled();
  });
});

describe('updateBadgeCount on Android', () => {
  const originalPlatformOS = Platform.OS;

  afterEach(() => {
    jest.clearAllMocks();
    Platform.OS = originalPlatformOS;
  });

  it('sets the app icon badge via notifee, matching the existing iOS behaviour', async () => {
    Platform.OS = 'android';
    await updateBadgeCount({ count: 3 });
    expect(notifee.setBadgeCount).toHaveBeenCalledWith(3);
  });
});
