import {
  ATTACHMENT_TYPES,
  VOICE_CALL_END_REASON,
  VOICE_CALL_PROVIDERS,
  VOICE_CALL_STATUS,
} from '@/constants';
import { Message, MessageType, VoiceCallStatus } from '@/types';

export type VoiceCallRecording = {
  dataUrl: string;
  contentType?: string | null;
  extension?: string | null;
};

export type VoiceCallDisplay = {
  status: VoiceCallStatus | undefined;
  isOutbound: boolean;
  isFailed: boolean;
  isLive: boolean;
  labelKey: string;
  subtextKey: string | null;
  subtextParams: { agentName?: string };
  handlerName: string | null;
  duration: string;
  recording: VoiceCallRecording | null;
  transcript: string | null;
};

const FAILED_STATUSES: string[] = [
  VOICE_CALL_STATUS.NO_ANSWER,
  VOICE_CALL_STATUS.FAILED,
  VOICE_CALL_STATUS.REJECTED,
];

const LIVE_STATUSES: string[] = [VOICE_CALL_STATUS.RINGING, VOICE_CALL_STATUS.IN_PROGRESS];

export const formatCallDuration = (durationInSeconds?: number | null) => {
  if (durationInSeconds === null || durationInSeconds === undefined) return '';
  const totalSeconds = Number(durationInSeconds);
  if (Number.isNaN(totalSeconds) || totalSeconds < 0) return '';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return hours > 0 ? `${hours.toString().padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
};

// The live call object is authoritative; content_attributes.data is the snapshot written when
// the message was created or last updated and is only consulted when the call object is absent.
type CallFacts = {
  direction?: string;
  status?: string;
  handlerName: string | null;
  durationSeconds: number | null;
  endReason: string | null;
  recordingUrl: string | null;
  transcript: string | null;
};

const getCallFacts = (message: Message): CallFacts => {
  const call = message.call;
  if (call) {
    return {
      direction: call.direction,
      status: call.status,
      handlerName: call.acceptedByAgentName || null,
      durationSeconds: call.durationSeconds ?? null,
      endReason: call.endReason || null,
      recordingUrl: call.recordingUrl || null,
      transcript: call.transcript || null,
    };
  }
  const data = message.contentAttributes?.data;
  return {
    direction: data?.callDirection,
    status: data?.status,
    handlerName: data?.acceptedBy?.name || null,
    durationSeconds: data?.durationSeconds ?? null,
    endReason: null,
    recordingUrl: null,
    transcript: null,
  };
};

const isOutboundCall = (message: Message, direction?: string) => {
  if (direction === 'outgoing' || direction === 'outbound') return true;
  if (direction === 'incoming' || direction === 'inbound') return false;
  return message.messageType === MessageType.outgoing;
};

const normalizeStatus = (status?: string): VoiceCallStatus | undefined =>
  status ? (status.replace(/_/g, '-') as VoiceCallStatus) : undefined;

const getRecording = (message: Message, recordingUrl: string | null): VoiceCallRecording | null => {
  const audio = (message.attachments || []).find(
    attachment => attachment.fileType === ATTACHMENT_TYPES.AUDIO,
  );
  if (audio) {
    return { dataUrl: audio.dataUrl, contentType: audio.contentType, extension: audio.extension };
  }
  return recordingUrl ? { dataUrl: recordingUrl, extension: 'wav' } : null;
};

const TWILIO_ANSWER_STATUSES = ['in-progress', 'inprogress', 'answered'];

// Whether Twilio's own status says the contact picked up
export const isTwilioAnswerStatus = (providerStatus?: string | null) =>
  !!providerStatus && TWILIO_ANSWER_STATUSES.includes(providerStatus.toLowerCase());

// A Twilio call this device placed whose contact has not picked up yet. The agent's own leg
// is connected to the conference meanwhile, so the call counts as connected on the device.
export const isAwaitingTwilioContact = (call: {
  provider?: string;
  callDirection?: string;
  answeredAt?: number;
}) =>
  call.provider === VOICE_CALL_PROVIDERS.TWILIO &&
  call.callDirection === 'outbound' &&
  !call.answeredAt;

// When the in-call timer starts: the contact's answer for a Twilio call this device placed,
// the moment this device joined otherwise
export const callTimerStart = (
  call: { provider?: string; callDirection?: string; answeredAt?: number },
  activeSince: number | undefined,
) =>
  call.provider === VOICE_CALL_PROVIDERS.TWILIO && call.callDirection === 'outbound'
    ? call.answeredAt
    : activeSince;

// Whether a call this device placed has reached the far handset. Twilio says so through
// its own status; WhatsApp has no such event, so the call id Meta hands back stands in.
export const isOutboundCallRinging = (call: {
  provider?: string;
  callSid?: string;
  providerStatus?: string | null;
}) =>
  call.provider === VOICE_CALL_PROVIDERS.TWILIO
    ? call.providerStatus === VOICE_CALL_STATUS.RINGING
    : !!call.callSid;

export const getVoiceCallDisplay = (message: Message): VoiceCallDisplay => {
  const facts = getCallFacts(message);
  const status = normalizeStatus(facts.status);
  const isOutbound = isOutboundCall(message, facts.direction);
  const isFailed = !!status && FAILED_STATUSES.includes(status);
  const isLive = !!status && LIVE_STATUSES.includes(status);
  const { handlerName } = facts;
  const duration = formatCallDuration(facts.durationSeconds);
  const wasDeclinedByAgent =
    isFailed && !isOutbound && facts.endReason === VOICE_CALL_END_REASON.AGENT_REJECTED;

  let labelKey: string;
  if (status === VOICE_CALL_STATUS.IN_PROGRESS) {
    labelKey = 'CONVERSATION.VOICE_CALL.CALL_IN_PROGRESS';
  } else if (status === VOICE_CALL_STATUS.COMPLETED) {
    labelKey = 'CONVERSATION.VOICE_CALL.CALL_ENDED';
  } else if (isFailed) {
    labelKey = isOutbound
      ? 'CONVERSATION.VOICE_CALL.NO_ANSWER_OUTBOUND_LABEL'
      : 'CONVERSATION.VOICE_CALL.MISSED_CALL';
  } else {
    labelKey = isOutbound
      ? 'CONVERSATION.VOICE_CALL.OUTGOING_CALL'
      : 'CONVERSATION.VOICE_CALL.INCOMING_CALL';
  }

  let subtextKey: string | null = null;
  let subtextParams: { agentName?: string } = {};
  if (status === VOICE_CALL_STATUS.COMPLETED || status === VOICE_CALL_STATUS.IN_PROGRESS) {
    if (handlerName) {
      subtextKey = 'CONVERSATION.VOICE_CALL.HANDLED_BY';
      subtextParams = { agentName: handlerName };
    }
  } else if (isFailed) {
    if (isOutbound) {
      subtextKey = 'CONVERSATION.VOICE_CALL.NO_ANSWER_OUTBOUND_SUBTEXT';
    } else if (wasDeclinedByAgent && handlerName) {
      subtextKey = 'CONVERSATION.VOICE_CALL.MISSED_CALL_DECLINED_BY';
      subtextParams = { agentName: handlerName };
    } else {
      subtextKey = 'CONVERSATION.VOICE_CALL.MISSED_CALL_INBOUND_SUBTEXT';
    }
  } else if (isOutbound) {
    if (handlerName) {
      subtextKey = 'CONVERSATION.VOICE_CALL.HANDLED_BY';
      subtextParams = { agentName: handlerName };
    } else {
      subtextKey = 'CONVERSATION.VOICE_CALL.CALLING';
    }
  } else {
    subtextKey = 'CONVERSATION.VOICE_CALL.NOT_ANSWERED_YET';
  }

  return {
    status,
    isOutbound,
    isFailed,
    isLive,
    labelKey,
    subtextKey,
    subtextParams,
    handlerName,
    duration,
    recording: getRecording(message, facts.recordingUrl),
    transcript: facts.transcript,
  };
};
