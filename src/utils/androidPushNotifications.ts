import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidGroupAlertBehavior, AndroidStyle, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';

import i18n from '@/i18n';
import { transformNotification } from '@/utils/camelCaseKeys';
import type { Notification } from '@/types/Notification';

const CHANNEL_ID = 'default';
const GROUP_ID = 'chatwoot-messages';
const SUMMARY_ID = 'chatwoot-message-summary';
const STORAGE_KEY = 'chatwoot.android.message-notifications';
const PENDING_PRESS_KEY = 'chatwoot.android.pending-notification-press';
const MAX_CONVERSATIONS = 5;
const MAX_MESSAGES_PER_CONVERSATION = 5;

const MESSAGE_NOTIFICATION_TYPES = [
  'conversation_creation',
  'assigned_conversation_new_message',
  'participating_conversation_new_message',
  'conversation_mention',
];

type RemoteMessage = {
  data?: {
    payload?: string;
  };
};

type StoredMessage = {
  text: string;
  timestamp: number;
  senderName: string;
};

type StoredConversation = {
  key: string;
  senderName: string;
  timestamp: number;
  payload: string;
  messages: StoredMessage[];
};

type NotificationState = {
  totalMessages: number;
  conversations: StoredConversation[];
};

const emptyState = (): NotificationState => ({
  totalMessages: 0,
  conversations: [],
});

const readState = async () => {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return emptyState();

  try {
    return JSON.parse(value) as NotificationState;
  } catch {
    return emptyState();
  }
};

const notificationFromMessage = (message: RemoteMessage) => {
  const payload = message.data?.payload;
  if (!payload) return null;

  try {
    return JSON.parse(payload)?.data?.notification ?? null;
  } catch {
    return null;
  }
};

const conversationIdFor = (notification: Notification) =>
  notification.conversationId ??
  notification.primaryActor?.conversationId ??
  notification.primaryActor?.id;

const displayBasicNotification = async (notification: Notification, payload: string) => {
  await notifee.displayNotification({
    id: `chatwoot-notification-${notification.id}`,
    title: notification.pushMessageTitle || 'Chatwoot',
    body: notification.pushMessageBody || '',
    data: { payload },
    android: {
      channelId: CHANNEL_ID,
      pressAction: { id: 'default' },
    },
  });
};

let displayQueue = Promise.resolve();

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (Platform.OS !== 'android' || type !== EventType.PRESS) return;

  const payload = detail.notification?.data?.payload;
  if (typeof payload === 'string') {
    await AsyncStorage.setItem(PENDING_PRESS_KEY, payload);
  }
});

const displayMessageNotification = async (notification: Notification, payload: string) => {
  const conversationId = conversationIdFor(notification);
  if (!conversationId) {
    await displayBasicNotification(notification, payload);
    return;
  }

  const accountId = notification.accountId ?? 0;
  const conversationKey = `${accountId}-${conversationId}`;
  const senderName =
    notification.senderName ||
    notification.pushMessageTitle ||
    i18n.t('NOTIFICATION.PUSH.NEW_MESSAGE');
  const text = notification.messagePreview || notification.pushMessageBody || '';
  const timestamp = (notification.createdAt || Math.floor(Date.now() / 1000)) * 1000;
  const state = await readState();
  const existingConversation = state.conversations.find(item => item.key === conversationKey);
  const messages = [
    ...(existingConversation?.messages || []),
    { text, timestamp, senderName },
  ].slice(-MAX_MESSAGES_PER_CONVERSATION);

  const conversation: StoredConversation = {
    key: conversationKey,
    senderName,
    timestamp,
    payload,
    messages,
  };
  const conversations = [
    conversation,
    ...state.conversations.filter(item => item.key !== conversationKey),
  ]
    .sort((first, second) => second.timestamp - first.timestamp)
    .slice(0, MAX_CONVERSATIONS);
  const nextState = {
    totalMessages: state.totalMessages + 1,
    conversations,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

  await notifee.displayNotification({
    id: `chatwoot-conversation-${conversationKey}`,
    title: senderName,
    body: text,
    data: { payload },
    android: {
      channelId: CHANNEL_ID,
      groupId: GROUP_ID,
      groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
      pressAction: { id: 'default' },
      showTimestamp: true,
      timestamp,
      style: {
        type: AndroidStyle.MESSAGING,
        person: { name: i18n.t('NOTIFICATION.PUSH.YOU') },
        messages: messages.map(message => ({
          text: message.text,
          timestamp: message.timestamp,
          person: { name: message.senderName },
        })),
      },
    },
  });

  const conversationCount = conversations.length;
  const conversationLabel = i18n.t(
    conversationCount === 1 ? 'NOTIFICATION.PUSH.CHAT' : 'NOTIFICATION.PUSH.CHATS',
  );
  const messageLabel = i18n.t(
    nextState.totalMessages === 1 ? 'NOTIFICATION.PUSH.MESSAGE' : 'NOTIFICATION.PUSH.MESSAGES',
  );

  await notifee.displayNotification({
    id: SUMMARY_ID,
    title: i18n.t('NOTIFICATION.PUSH.SUMMARY', {
      messageCount: nextState.totalMessages,
      messageLabel,
      conversationCount,
      conversationLabel,
    }),
    android: {
      channelId: CHANNEL_ID,
      groupId: GROUP_ID,
      groupSummary: true,
      groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
      pressAction: { id: 'default' },
      style: {
        type: AndroidStyle.INBOX,
        lines: conversations.map(item => {
          const latestMessage = item.messages[item.messages.length - 1];
          return `${item.senderName}: ${latestMessage?.text || ''}`;
        }),
      },
    },
  });
};

export const displayAndroidPushNotification = async (message: RemoteMessage) => {
  if (Platform.OS !== 'android') return;

  const rawNotification = notificationFromMessage(message);
  const payload = message.data?.payload;
  if (!rawNotification || !payload) return;

  const notification = transformNotification(rawNotification);
  const displayTask = displayQueue.then(() =>
    MESSAGE_NOTIFICATION_TYPES.includes(notification.notificationType)
      ? displayMessageNotification(notification, payload)
      : displayBasicNotification(notification, payload),
  );
  displayQueue = displayTask.catch(() => undefined);
  await displayTask;
};

export const clearAndroidMessageNotificationState = () => AsyncStorage.removeItem(STORAGE_KEY);

export const consumePendingAndroidNotificationPress = async () => {
  const payload = await AsyncStorage.getItem(PENDING_PRESS_KEY);
  if (payload) await AsyncStorage.removeItem(PENDING_PRESS_KEY);
  return payload;
};
