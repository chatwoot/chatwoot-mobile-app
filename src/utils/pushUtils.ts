import { NOTIFICATION_TYPES } from '@/constants';
import { BrandTokens } from '@/theme';
import { Notification } from '@/types/Notification';
import { Platform } from 'react-native';

let notifee: typeof import('@notifee/react-native').default | undefined;

// Habilitar Notifee tanto no iOS quanto no Android
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  notifee = require('@notifee/react-native')
    .default as typeof import('@notifee/react-native').default;
}

export const clearAllDeliveredNotifications = async (): Promise<void> => {
  if (Platform.OS === 'ios' && notifee) {
    await notifee.cancelAllNotifications();
  }
};

export const updateBadgeCount = async (count: number): Promise<void> => {
  if (Platform.OS === 'ios' && count >= 0 && notifee) {
    await notifee.setBadgeCount(count);
  }
};

export function findConversationLinkFromPush({
  notification,
  installationUrl,
}: {
  notification: Notification | null | undefined;
  installationUrl: string;
}): string | undefined {
  if (!notification?.notificationType) {
    return;
  }

  if (!NOTIFICATION_TYPES.includes(notification.notificationType)) {
    return;
  }

  const { primaryActor, primaryActorId, primaryActorType } = notification;

  if (!primaryActor || !primaryActorId || !primaryActorType) {
    return;
  }

  const conversationId =
    primaryActorType === 'Conversation'
      ? primaryActor.id
      : primaryActorType === 'Message'
        ? primaryActor.conversationId
        : null;

  if (!conversationId) {
    return;
  }

  const baseUrl = installationUrl.replace(/\/+$/, '');
  return `${baseUrl}/app/accounts/1/conversations/${conversationId}/${primaryActorId}/${primaryActorType}`;
}

interface FCMMessage {
  data?: {
    payload?: string;
    notification?: string;
    conversation_id?: string;
    message_id?: string;
    event_type?: string;
    title?: string;
    body?: string;
    content?: string;
    sender_id?: string;
    sender_name?: string;
    sender_email?: string;
    sender?: {
      id?: number | string;
      name?: string;
      email?: string;
    };
    [key: string]: any;
  };
}

const EVENT_TYPE_MAP: Record<string, string> = {
  'conversation.created': 'conversation_creation',
  conversation_created: 'conversation_creation',
  'conversation.assigned': 'conversation_assignment',
  conversation_assigned: 'conversation_assignment',
  'message.created': 'assigned_conversation_new_message',
  message_created: 'assigned_conversation_new_message',
  'conversation.mentioned': 'conversation_mention',
  conversation_mentioned: 'conversation_mention',
  'message.received': 'participating_conversation_new_message',
  message_received: 'participating_conversation_new_message',
};

const DEFAULT_NOTIFICATION_TYPE = 'assigned_conversation_new_message';

function mapLaravelNotificationToAppFormat(data: Record<string, any>): any {
  const notificationType = EVENT_TYPE_MAP[data.event_type] || DEFAULT_NOTIFICATION_TYPE;
  const senderId = data.sender_id || data.sender?.id || null;
  const senderName = data.sender_name || data.sender?.name || null;
  const senderEmail = data.sender_email || data.sender?.email || null;

  const sender = senderName
    ? {
        id: senderId,
        name: senderName,
        email: senderEmail,
      }
    : null;

  return {
    id: data.message_id || data.conversation_id || Date.now(),
    notificationType,
    pushMessageTitle: data.title || 'Nova mensagem',
    primaryActorType: data.message_id ? 'Message' : 'Conversation',
    primaryActorId: data.message_id || data.conversation_id,
    primaryActor: {
      id: data.conversation_id,
      conversationId: data.conversation_id,
      inboxId: data.inbox_id || 1,
      meta: {
        sender: sender || {},
      },
      additionalAttributes: {},
    },
    sender,
  };
}

function enrichNotificationWithSender(notification: any, messageData: FCMMessage['data']): any {
  if (!messageData?.sender_name && !messageData?.sender_id && !messageData?.sender) {
    return notification;
  }

  return {
    ...notification,
    sender: {
      id: messageData.sender_id || messageData.sender?.id,
      name: messageData.sender_name || messageData.sender?.name,
      email: messageData.sender_email || messageData.sender?.email,
    },
  };
}

export function findNotificationFromFCM({ message }: { message: FCMMessage }): any | null {
  if (message?.data?.payload) {
    try {
      const parsedPayload = JSON.parse(message.data.payload);
      const notification = parsedPayload.data?.notification || parsedPayload.data;
      return enrichNotificationWithSender(notification, message.data);
    } catch {
      return null;
    }
  }

  if (message?.data?.notification) {
    try {
      const notification = JSON.parse(message.data.notification);
      return enrichNotificationWithSender(notification, message.data);
    } catch {
      return null;
    }
  }

  if (message?.data && (message.data.conversation_id || message.data.event_type)) {
    return mapLaravelNotificationToAppFormat(message.data);
  }

  return null;
}

interface SenderInfo {
  name?: string;
  id?: string;
  email?: string;
}

const GENERIC_TITLES = ['Nova mensagem', BrandTokens.name.toLowerCase()];
const DEFAULT_TITLE = 'Nova mensagem';

function extractSenderName(
  remoteMessageData?: Record<string, any>,
  notification?: any,
  transformedNotification?: Notification,
  remoteMessageNotification?: any,
): string | null {
  const sources: (SenderInfo | string | undefined)[] = [
    remoteMessageData?.sender_name,
    remoteMessageData?.sender?.name,
    typeof remoteMessageData?.sender === 'string' ? remoteMessageData.sender : undefined,
    notification?.primaryActor?.meta?.sender?.name,
    transformedNotification?.primaryActor?.meta?.sender?.name,
  ];

  for (const source of sources) {
    if (typeof source === 'string' && source) {
      return source;
    }
    if (source && typeof source === 'object' && source.name) {
      return source.name;
    }
  }

  const fcmTitle = remoteMessageNotification?.title;
  if (fcmTitle && !GENERIC_TITLES.includes(fcmTitle)) {
    return fcmTitle;
  }

  return null;
}

function extractMessageContent(
  remoteMessageNotification?: any,
  remoteMessageData?: Record<string, any>,
  notification?: any,
  transformedNotification?: Notification,
): string {
  return (
    remoteMessageNotification?.body ||
    remoteMessageData?.body ||
    remoteMessageData?.content ||
    remoteMessageData?.message ||
    notification?.body ||
    notification?.content ||
    notification?.message ||
    transformedNotification?.pushMessageTitle ||
    DEFAULT_TITLE
  );
}

export function formatNotificationWithSender({
  notification,
  transformedNotification,
  remoteMessageData,
  remoteMessageNotification,
}: {
  notification: any;
  transformedNotification: Notification;
  remoteMessageData?: Record<string, any>;
  remoteMessageNotification?: any;
}): { title: string; body: string } {
  const senderName = extractSenderName(
    remoteMessageData,
    notification,
    transformedNotification,
    remoteMessageNotification,
  );

  const messageContent = extractMessageContent(
    remoteMessageNotification,
    remoteMessageData,
    notification,
    transformedNotification,
  );

  const fallbackTitle =
    remoteMessageNotification?.title ||
    notification?.title ||
    transformedNotification?.pushMessageTitle ||
    DEFAULT_TITLE;

  return {
    title: senderName || fallbackTitle,
    body: messageContent,
  };
}
