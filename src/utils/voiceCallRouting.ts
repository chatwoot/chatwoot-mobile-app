import { CONTENT_TYPES, MESSAGE_TYPES, VOICE_CALL_STATUS } from '@/constants';
import type { Conversation, Message } from '@/types';
import type { CallerSnapshot, LiveCallInput, VoiceCallDirection } from '@/store/call/callTypes';

export type RoutingContext = {
  currentUserId?: number | null;
  receivesCalls?: boolean;
  dismissedCallSids: string[];
  localCallSid?: string | null;
};

const isOutboundFromAnotherDevice = (data: ExtractedCallData, context: RoutingContext) =>
  data.callDirection === 'outbound' && data.callSid !== context.localCallSid;

export type ExtractedCallData = {
  callSid?: string;
  callId?: number;
  provider?: LiveCallInput['provider'];
  status?: string;
  callDirection: VoiceCallDirection;
  conversationId?: number;
  inboxId?: number;
  assigneeId: number | null;
  senderId?: number;
  caller: CallerSnapshot | null;
};

export type RoutingDecision =
  | { action: 'add'; call: LiveCallInput }
  | { action: 'remove'; callSid: string }
  | { action: 'ignore' };

export const isVoiceCallMessage = (message?: Message | null) =>
  message?.contentType === CONTENT_TYPES.VOICE_CALL;

const extractAssigneeId = (conversation?: Partial<Conversation> | null): number | null => {
  const direct = (conversation as { assigneeId?: number } | null | undefined)?.assigneeId;
  return direct || conversation?.meta?.assignee?.id || null;
};

const isAssignedToAnotherAgent = (assigneeId: number | null, currentUserId?: number | null) => {
  if (currentUserId === null || currentUserId === undefined) return false;
  return !!assigneeId && assigneeId !== currentUserId;
};

export const shouldShowCall = ({
  callDirection,
  senderId,
  assigneeId,
  currentUserId,
}: {
  callDirection: VoiceCallDirection;
  senderId?: number;
  assigneeId: number | null;
  currentUserId?: number | null;
}) => {
  if (callDirection === 'outbound') return senderId === currentUserId;
  return !isAssignedToAnotherAgent(assigneeId, currentUserId);
};

export const shouldRingInbound = (callDirection: VoiceCallDirection, receivesCalls?: boolean) =>
  callDirection === 'outbound' || !!receivesCalls;

// Outbound senders identify agents, not contacts.
export const extractCallerSnapshot = (message: Message): CallerSnapshot | null => {
  if (message.messageType !== MESSAGE_TYPES.INCOMING) return null;
  const sender = message.sender as
    | { name?: string | null; phoneNumber?: string | null; thumbnail?: string | null }
    | null
    | undefined;
  if (!sender) return null;
  return { name: sender.name, phone: sender.phoneNumber, avatar: sender.thumbnail };
};

export const extractCallData = (message: Message): ExtractedCallData => {
  const call = message.call;
  const direction = call?.direction;
  return {
    callSid: call?.providerCallId,
    callId: call?.id,
    provider: call?.provider,
    status: call?.status,
    callDirection: direction === 'outgoing' || direction === 'outbound' ? 'outbound' : 'inbound',
    conversationId: message.conversationId,
    inboxId: message.inboxId ?? message.conversation?.inboxId,
    assigneeId: extractAssigneeId(message.conversation),
    senderId: message.senderId ?? (message.sender as { id?: number } | null | undefined)?.id,
    caller: extractCallerSnapshot(message),
  };
};

const toLiveCall = (data: ExtractedCallData): LiveCallInput => ({
  callSid: data.callSid as string,
  callId: data.callId,
  provider: data.provider,
  conversationId: data.conversationId,
  inboxId: data.inboxId,
  callDirection: data.callDirection,
  senderId: data.senderId,
  caller: data.caller,
});

export const routeVoiceCallCreated = (
  message: Message,
  context: RoutingContext,
): RoutingDecision => {
  if (!isVoiceCallMessage(message)) return { action: 'ignore' };
  const data = extractCallData(message);
  if (!data.callSid) return { action: 'ignore' };
  if (context.dismissedCallSids.includes(data.callSid)) return { action: 'ignore' };
  if (data.status !== VOICE_CALL_STATUS.RINGING) return { action: 'ignore' };
  if (!shouldShowCall({ ...data, currentUserId: context.currentUserId })) {
    return { action: 'ignore' };
  }
  if (isOutboundFromAnotherDevice(data, context)) return { action: 'ignore' };
  if (!shouldRingInbound(data.callDirection, context.receivesCalls)) {
    return { action: 'ignore' };
  }
  return { action: 'add', call: toLiveCall(data) };
};

export const routeVoiceCallUpdated = (
  message: Message,
  context: RoutingContext,
): RoutingDecision => {
  if (!isVoiceCallMessage(message)) return { action: 'ignore' };
  const data = extractCallData(message);
  if (!data.callSid) return { action: 'ignore' };
  if (data.callSid === context.localCallSid) return { action: 'ignore' };
  if (!shouldShowCall({ ...data, currentUserId: context.currentUserId })) {
    return { action: 'remove', callSid: data.callSid };
  }
  if (isOutboundFromAnotherDevice(data, context))
    return { action: 'remove', callSid: data.callSid };
  if (data.status === VOICE_CALL_STATUS.RINGING) {
    if (context.dismissedCallSids.includes(data.callSid)) return { action: 'ignore' };
    if (!shouldRingInbound(data.callDirection, context.receivesCalls)) {
      return { action: 'ignore' };
    }
    return { action: 'add', call: toLiveCall(data) };
  }
  return { action: 'ignore' };
};

export const callsHiddenByConversationUpdate = (
  conversation: Pick<Conversation, 'id'> & Partial<Conversation>,
  calls: LiveCallInput[],
  currentUserId?: number | null,
  localCallSid?: string | null,
): string[] => {
  const assigneeId = extractAssigneeId(conversation);
  if (!isAssignedToAnotherAgent(assigneeId, currentUserId)) return [];
  return calls
    .filter(
      call =>
        call.callSid !== localCallSid &&
        call.conversationId === conversation.id &&
        !shouldShowCall({
          callDirection: call.callDirection,
          senderId: call.senderId,
          assigneeId,
          currentUserId,
        }),
    )
    .map(call => call.callSid);
};
