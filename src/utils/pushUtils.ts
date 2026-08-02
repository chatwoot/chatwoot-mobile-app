import { Platform } from 'react-native';
import { NOTIFICATION_TYPES } from '@/constants';
import { Notification } from '@/types/Notification';

let notifee: typeof import('@notifee/react-native').default | undefined;
// [conomni] m9: раньше notifee грузился только под iOS (использовался исключительно для
// бейджа). Теперь нужен и на Android — свой канал уведомлений + бейдж иконки приложения.
let AndroidImportance: typeof import('@notifee/react-native').AndroidImportance | undefined;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default as typeof import('@notifee/react-native').default;
  AndroidImportance = notifeeModule.AndroidImportance;
}

// Должен совпадать с NOTIFICATION_CHANNEL_ID в with-android-notifications.js (meta-data
// default_notification_channel_id в AndroidManifest) — иначе FCM снова уйдёт в
// fcm_fallback_notification_channel.
export const ANDROID_NOTIFICATION_CHANNEL_ID = 'conomni_messages';

// [conomni] m9: без явного канала с высокой важностью FCM использует
// fcm_fallback_notification_channel — MIUI и подобные оболочки считают его неважным
// (`No peeking: unimportant notification`): пуш не всплывает и приходит без звука.
// createChannel идемпотентен — повторный вызов при каждом старте приложения безопасен
// (notifee обновит существующий канал, а не создаст дубликат).
export const ensureAndroidNotificationChannel = async () => {
  if (Platform.OS !== 'android' || !notifee || !AndroidImportance) {
    return;
  }
  await notifee.createChannel({
    id: ANDROID_NOTIFICATION_CHANNEL_ID,
    name: 'Сообщения',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    badge: true,
  });
};

export const clearAllDeliveredNotifications = async () => {
  // Не в скоупе m9 (диагноз не про очистку доставленных уведомлений) — поведение
  // Android не менялось, оставлено как было (только iOS).
  if (Platform.OS === 'ios' && notifee) {
    await notifee.cancelAllNotifications();
  }
};

export const updateBadgeCount = async ({ count = 0 }) => {
  if ((Platform.OS === 'ios' || Platform.OS === 'android') && count >= 0 && notifee) {
    await notifee.setBadgeCount(count);
  }
};

export const findConversationLinkFromPush = ({
  notification,
  installationUrl,
}: {
  notification: Notification;
  installationUrl: string;
}) => {
  const { notificationType } = notification;

  if (NOTIFICATION_TYPES.includes(notificationType)) {
    const { primaryActor, primaryActorId, primaryActorType } = notification;
    let conversationId = null;
    if (primaryActorType === 'Conversation') {
      conversationId = primaryActor.id;
    } else if (primaryActorType === 'Message') {
      conversationId = primaryActor.conversationId;
    }
    if (conversationId) {
      const conversationLink = `${installationUrl}/app/accounts/1/conversations/${conversationId}/${primaryActorId}/${primaryActorType}`;
      return conversationLink;
    }
  }
  return;
};

interface FCMMessage {
  data?: {
    payload?: string;
    notification?: string;
  };
}

export const findNotificationFromFCM = ({ message }: { message: FCMMessage }) => {
  let notification = null;
  // FCM HTTP v1
  if (message?.data?.payload) {
    const parsedPayload = JSON.parse(message.data.payload);
    notification = parsedPayload.data.notification;
  }
  // FCM legacy. It will be deprecated soon
  else {
    notification = JSON.parse(message.data.notification);
  }
  return notification;
};
