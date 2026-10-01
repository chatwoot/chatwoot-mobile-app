import { Platform } from 'react-native';

import { cancelNativeCallNotification, takeNativeCallAction } from '@/services/voice/chatwootCalls';

// Android rings through a native call notification posted by the module's messaging
// service, so the ring appears before JavaScript has started. What is left here is the
// app's side: reading the button the agent pressed and clearing the notification once the
// app shows the call itself. iOS uses CallKit and never comes through here.

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
  accountId?: number;
  caller?: { name?: string; phone?: string; avatar?: string };
};

export const isCallPush = (data?: Record<string, unknown>) =>
  Platform.OS === 'android' && data?.type === 'voice_call.incoming' && !!data?.call_id;

export const cancelCallNotification = () => {
  if (Platform.OS !== 'android') return;
  cancelNativeCallNotification();
};

// What the agent chose on the native call notification or screen, read once the app is
// running
export const takePendingCallAction = (): PendingCallAction | null => {
  if (Platform.OS !== 'android') return null;
  const native = takeNativeCallAction();
  if (!native) return null;
  try {
    return JSON.parse(native) as PendingCallAction;
  } catch {
    return null;
  }
};
