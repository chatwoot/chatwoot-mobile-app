import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType, type Event } from '@notifee/react-native';

import { cancelNativeCallNotification, takeNativeCallAction } from '@/services/voice/chatwootCalls';

// Android rings through a native call notification posted by the module's messaging
// service, so the ring appears before JavaScript has started. What is left here is the
// app's side: reading the button the agent pressed and clearing the notification once the
// app shows the call itself. iOS uses CallKit and never comes through here.

const NOTIFICATION_ID = 'voice_call';
const PENDING_CALL_KEY = 'pendingCallAction';
export type CallPushPayload = {
  type?: string;
  call_id?: string;
  id?: string;
  provider?: string;
  conversation_id?: string;
  inbox_id?: string;
  account_id?: string;
  inbox_name?: string;
  caller?: string;
};

export type PendingCallAction = {
  action: 'answer' | 'decline';
  callSid: string;
  callId?: number;
  provider?: 'whatsapp' | 'twilio';
  conversationId?: number;
  inboxId?: number;
  caller?: { name?: string; phone?: string; avatar?: string };
};

export const isCallPush = (data?: Record<string, unknown>) =>
  Platform.OS === 'android' && data?.type === 'voice_call.incoming' && !!data?.call_id;

export const cancelCallNotification = async () => {
  if (Platform.OS !== 'android') return;
  cancelNativeCallNotification();
  await notifee.cancelNotification(NOTIFICATION_ID).catch(() => {});
};

// What the agent chose in the notification, read once the app is running
export const setPendingCallAction = async (pending: PendingCallAction) =>
  AsyncStorage.setItem(PENDING_CALL_KEY, JSON.stringify(pending));

export const takePendingCallAction = async (): Promise<PendingCallAction | null> => {
  if (Platform.OS !== 'android') return null;
  // The notification is posted natively, so its buttons record their choice there
  const native = takeNativeCallAction();
  if (native) {
    try {
      return JSON.parse(native) as PendingCallAction;
    } catch {
      // fall through to the JavaScript copy
    }
  }
  const raw = await AsyncStorage.getItem(PENDING_CALL_KEY);
  if (!raw) return null;
  await AsyncStorage.removeItem(PENDING_CALL_KEY);
  try {
    return JSON.parse(raw) as PendingCallAction;
  } catch {
    return null;
  }
};

// Notification presses arrive here whether or not the app was running
export const handleCallNotificationEvent = async ({ type, detail }: Event) => {
  if (Platform.OS !== 'android') return;
  if (type !== EventType.ACTION_PRESS && type !== EventType.PRESS) return;
  const callSid = detail.notification?.data?.callSid as string | undefined;
  if (!callSid) return;
  const actionId = detail.pressAction?.id;
  if (actionId === 'decline') {
    await setPendingCallAction({
      action: 'decline',
      callSid,
      callId: Number(detail.notification?.data?.callId) || undefined,
    });
    await cancelCallNotification();
    return;
  }
  await setPendingCallAction({
    action: 'answer',
    callSid,
    callId: Number(detail.notification?.data?.callId) || undefined,
  });
  await cancelCallNotification();
};
