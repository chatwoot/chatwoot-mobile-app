import { CONTENT_TYPES, MESSAGE_TYPES, VOICE_CALL_STATUS } from '@/constants';
import type { Conversation, Message } from '@/types';
import type { CallerSnapshot, LiveCallInput, VoiceCallDirection } from '@/store/call/callTypes';

// Pure rules for turning call messages and conversation updates into call-list changes.
// They mirror the web dashboard's voice helper so both clients ring the same agents.

export type RoutingContext = {
  currentUserId?: number | null;
  currentUserAvailability?: string | null;
  dismissedCallSids: string[];
  // The call this device placed itself; an outbound call from the same agent's other
  // device is not shown here, since only the originating device holds its media
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

// Outbound calls belong to whoever placed them; inbound calls follow the assignee.
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

// Only agents who set themselves online get an inbound ring; outbound always shows.
export const shouldRingInbound = (
  callDirection: VoiceCallDirection,
  currentUserAvailability?: string | null,
) => callDirection === 'outbound' || currentUserAvailability === 'online';

// Only incoming messages carry the contact as sender; on outbound the sender is the agent.
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

// A call message can already be terminal when it arrives; ring only while ringing.
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
  if (!shouldRingInbound(data.callDirection, context.currentUserAvailability)) {
    return { action: 'ignore' };
  }
  return { action: 'add', call: toLiveCall(data) };
};

// Updates drop calls the agent may no longer see and re-add ones still ringing.
export const routeVoiceCallUpdated = (
  message: Message,
  context: RoutingContext,
): RoutingDecision => {
  if (!isVoiceCallMessage(message)) return { action: 'ignore' };
  const data = extractCallData(message);
  if (!data.callSid) return { action: 'ignore' };
  if (!shouldShowCall({ ...data, currentUserId: context.currentUserId })) {
    return { action: 'remove', callSid: data.callSid };
  }
  if (isOutboundFromAnotherDevice(data, context))
    return { action: 'remove', callSid: data.callSid };
  if (data.status === VOICE_CALL_STATUS.RINGING) {
    if (context.dismissedCallSids.includes(data.callSid)) return { action: 'ignore' };
    if (!shouldRingInbound(data.callDirection, context.currentUserAvailability)) {
      return { action: 'ignore' };
    }
    return { action: 'add', call: toLiveCall(data) };
  }
  return { action: 'ignore' };
};

// When a conversation is handed to another agent, its inbound calls leave this device.
export const callsHiddenByConversationUpdate = (
  conversation: Pick<Conversation, 'id'> & Partial<Conversation>,
  calls: LiveCallInput[],
  currentUserId?: number | null,
): string[] => {
  const assigneeId = extractAssigneeId(conversation);
  if (!isAssignedToAnotherAgent(assigneeId, currentUserId)) return [];
  return calls
    .filter(
      call =>
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
