import { Platform } from 'react-native';

import { cancelNativeCallNotification, takeNativeCallAction } from '@/services/voice/chatwootCalls';
import type { LiveCallInput } from '@/store/call/callTypes';

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
  // On a cancel: the call's status once the ring ended
  reason?: string;
};

export type PendingCallAction = {
  // `end`: a call in progress was hung up from a system surface while the app was not running
  action: 'answer' | 'decline' | 'end';
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

// The ring is over: answered, declined, dropped or timed out
export const isCallCancelPush = (data?: Record<string, unknown>) =>
  Platform.OS === 'android' && data?.type === 'voice_call.cancel' && !!data?.call_id;

const toNumber = (value?: string) => (value ? Number(value) || undefined : undefined);

// The ringing call a push describes, for a ring the app takes straight from the push
export const callFromPush = (data: CallPushPayload): LiveCallInput | null => {
  if (!data.call_id) return null;
  let caller: { name?: string; phone?: string; avatar?: string } | null = null;
  try {
    caller = data.caller ? JSON.parse(data.caller) : null;
  } catch {
    caller = null;
  }
  return {
    callSid: data.call_id,
    callId: toNumber(data.id),
    provider: data.provider === 'twilio' ? 'twilio' : 'whatsapp',
    conversationId: toNumber(data.conversation_id),
    inboxId: toNumber(data.inbox_id),
    accountId: toNumber(data.account_id),
    callDirection: 'inbound',
    caller: caller
      ? {
          name: caller.name ?? undefined,
          phone: caller.phone ?? undefined,
          avatar: caller.avatar ?? undefined,
        }
      : null,
  };
};

// Takes down the ring notifications; the rings named in `keepRinging` are the app's to
// show while it is in front, and go back to notifications if it leaves the front
export const cancelCallNotification = (keepRinging: string[] = []) => {
  if (Platform.OS !== 'android') return;
  cancelNativeCallNotification(keepRinging);
};

// What the agent chose on the native call notification or screen, read once the app is
// running: the oldest choice waiting, or the one for the named call
export const takePendingCallAction = (callSid?: string): PendingCallAction | null => {
  if (Platform.OS !== 'android') return null;
  const native = takeNativeCallAction(callSid);
  if (!native) return null;
  try {
    return JSON.parse(native) as PendingCallAction;
  } catch {
    return null;
  }
};
