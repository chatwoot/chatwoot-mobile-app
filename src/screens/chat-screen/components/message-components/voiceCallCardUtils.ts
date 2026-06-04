import { Message, MessageType } from '@/types';

type VoiceCallDisplay = {
  titleKey?: string;
  fallbackTitle?: string;
  detailKeys: string[];
  duration: string;
  recordingUrl?: string;
  note?: string;
  isEnded: boolean;
};

type CallDirection = 'inbound' | 'outbound';

const ENDED_STATUSES = ['completed', 'ended'];
const MISSED_STATUSES = ['busy', 'canceled', 'failed', 'missed', 'no-answer'];
const RINGING_STALE_AFTER_SECONDS = 120;

const humanize = (value?: string) => {
  if (!value) {
    return '';
  }

  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const normalizeStatus = (status?: string) => status?.replace(/_/g, '-').toLowerCase();

const normalizeDirection = (direction?: string): CallDirection | undefined => {
  if (direction === 'outgoing' || direction === 'outbound') return 'outbound';
  if (direction === 'incoming' || direction === 'inbound') return 'inbound';
  return undefined;
};

const getMessageDirection = (message: Message): CallDirection =>
  message.messageType === MessageType.outgoing ? 'outbound' : 'inbound';

const formatDuration = (duration?: number | string) => {
  const numericDuration = Number(duration);
  if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
    return '';
  }

  const minutes = Math.floor(numericDuration / 60);
  const seconds = numericDuration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const findRecordingUrl = (message: Message, callRecordingUrl?: string) => {
  if (callRecordingUrl) {
    return callRecordingUrl;
  }

  return message.attachments?.find(attachment => attachment.fileType === 'audio')?.dataUrl;
};

const isTerminalStatus = (status?: string) => {
  const normalizedStatus = normalizeStatus(status);
  return (
    ENDED_STATUSES.includes(normalizedStatus || '') ||
    MISSED_STATUSES.includes(normalizedStatus || '')
  );
};

const isStaleRinging = (message: Message, status?: string) => {
  if (status !== 'ringing') return false;

  const createdAt = Number(message.createdAt);
  if (!Number.isFinite(createdAt) || createdAt <= 0) return false;

  return Date.now() / 1000 - createdAt > RINGING_STALE_AFTER_SECONDS;
};

const getCallData = (message: Message) => {
  const call = message.call || {};
  const contentData = message.contentAttributes?.data || {};
  const callStatus = normalizeStatus(call.status);
  const contentStatus = normalizeStatus(contentData.status);

  if (isTerminalStatus(callStatus) && contentStatus === 'ringing') {
    return {
      ...contentData,
      ...call,
    };
  }

  return {
    ...call,
    ...contentData,
  };
};

export const getVoiceCallDisplay = (message: Message): VoiceCallDisplay => {
  const callData = getCallData(message);
  const status = normalizeStatus(callData?.status);
  const displayStatus = isStaleRinging(message, status) ? 'no-answer' : status;
  const recordingUrl = findRecordingUrl(message, callData?.recordingUrl || callData?.recording_url);
  const isEnded = !!recordingUrl || ENDED_STATUSES.includes(displayStatus || '');
  const direction =
    normalizeDirection(callData?.callDirection || callData?.direction) ||
    getMessageDirection(message);
  const duration = formatDuration(
    callData?.durationSeconds ??
      callData?.duration_seconds ??
      callData?.duration ??
      callData?.recordingDuration ??
      callData?.recording_duration,
  );

  if (isEnded) {
    return {
      titleKey: 'VOICE_CALL.CALL_ENDED',
      detailKeys: [direction === 'outbound' ? 'VOICE_CALL.YOU_CALLED' : 'VOICE_CALL.YOU_ANSWERED'],
      duration,
      recordingUrl,
      note: callData?.summary || callData?.transcript,
      isEnded,
    };
  }

  if (displayStatus === 'ringing') {
    return {
      titleKey: 'VOICE_CALL.RINGING',
      detailKeys: [],
      duration,
      recordingUrl,
      note: callData?.summary || callData?.transcript,
      isEnded,
    };
  }

  if (MISSED_STATUSES.includes(displayStatus || '')) {
    return {
      titleKey: 'VOICE_CALL.MISSED_CALL',
      detailKeys: [],
      duration,
      recordingUrl,
      note: callData?.summary || callData?.transcript,
      isEnded,
    };
  }

  return {
    titleKey: displayStatus ? undefined : 'VOICE_CALL.TITLE',
    fallbackTitle: humanize(displayStatus),
    detailKeys: [],
    duration,
    recordingUrl,
    note: callData?.summary || callData?.transcript,
    isEnded,
  };
};
