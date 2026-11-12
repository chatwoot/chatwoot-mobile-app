import { Platform } from 'react-native';

import {
  abandonAnswer,
  cancelNativeCallNotification,
  takeNativeCallAction,
} from '@/services/voice/chatwootCalls';
import type { LiveCallInput } from '@/store/call/callTypes';

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
  // Terminal call status, supplied on cancellation.
  reason?: string;
};

export type PendingCallAction = {
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

export const isCallCancelPush = (data?: Record<string, unknown>) =>
  Platform.OS === 'android' && data?.type === 'voice_call.cancel' && !!data?.call_id;

const toNumber = (value?: string) => (value ? Number(value) || undefined : undefined);

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

export const cancelCallNotification = (keepRinging: string[] = []) => {
  if (Platform.OS !== 'android') return;
  cancelNativeCallNotification(keepRinging);
};

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

export const discardPendingCallActions = () => {
  for (let pending = takePendingCallAction(); pending; pending = takePendingCallAction()) {
    if (pending.action === 'answer') abandonAnswer(pending.callSid);
  }
};
