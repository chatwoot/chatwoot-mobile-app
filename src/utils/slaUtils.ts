import { SLA, SLAEvent, SLAStatus } from '@/types/common/SLA';

type SLAConversation = {
  status?: string;
  firstReplyCreatedAt?: number | string | null;
  waitingSince?: number | string | null;
};

type SLATypeStatus = {
  type: string;
  threshold: number | null;
  icon: string;
  isSlaMissed: boolean;
};

const EMPTY_STATUS: SLAStatus = { type: '', threshold: '', icon: '', isSlaMissed: false };

const SLA_TYPES = ['FRT', 'NRT', 'RT'];

export const formatSLATime = (seconds: number) => {
  const absSeconds = Math.abs(seconds);
  const units: [string, number][] = [
    ['y', 31536000],
    ['mo', 2592000],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ];

  if (absSeconds < 60) return '1m';

  const parts: string[] = [];
  let remaining = absSeconds;
  units.forEach(([unit, value]) => {
    if (parts.length >= 2) return;
    const count = Math.floor(remaining / value);
    if (count > 0) {
      parts.push(`${count}${unit}`);
      remaining -= count * value;
    }
  });

  return parts.join(' ');
};

const toUnixTimestamp = (value?: number | string | null): number | null => {
  if (!value) return null;
  if (typeof value === 'number') return value;

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) return numericValue;

  const parsedTimestamp = Date.parse(value);
  return Number.isNaN(parsedTimestamp) ? null : Math.floor(parsedTimestamp / 1000);
};

const isTerminalSLAStatus = (status?: string) => ['hit', 'missed'].includes(status ?? '');

const isSLACompleted = (sla: SLA, conversation: SLAConversation) =>
  isTerminalSLAStatus(sla.slaStatus) || conversation.status === 'resolved';

/** Whether the server sends the due-at timestamps this evaluator relies on. */
export const hasSLADueTimes = (appliedSla?: SLA | null) =>
  !!appliedSla && appliedSla.slaFrtDueAt !== undefined;

export const shouldRefreshSLAStatus = ({
  appliedSla,
  chat,
}: {
  appliedSla?: SLA | null;
  chat?: SLAConversation | null;
}) => {
  if (!appliedSla || !chat) return false;
  return !isSLACompleted(appliedSla, chat);
};

/**
 * Evaluates the most urgent SLA status from the backend-computed due times and
 * the recorded miss events. Recorded misses stay visible after the conversation
 * is resolved.
 */
export const evaluateSLAStatus = ({
  appliedSla,
  chat,
  slaEvents = [],
}: {
  appliedSla?: SLA | null;
  chat?: SLAConversation | null;
  slaEvents?: SLAEvent[];
}): SLAStatus => {
  if (!appliedSla || !chat) return EMPTY_STATUS;

  const sla = appliedSla;
  const currentTime = Math.floor(Date.now() / 1000);
  const isCompleted = isSLACompleted(sla, chat);
  const completionTime = isCompleted ? toUnixTimestamp(sla.slaCompletedAt) : null;
  const evaluationTime = completionTime || (isCompleted ? null : currentTime);
  const slaStatuses: SLATypeStatus[] = [];

  const dueAtByType: Record<string, number | null | undefined> = {
    FRT: sla.slaFrtDueAt,
    RT: sla.slaRtDueAt,
  };
  const firstReplyCreatedAt = toUnixTimestamp(chat.firstReplyCreatedAt);
  const shouldCheckFirstResponse =
    !firstReplyCreatedAt || firstReplyCreatedAt > (sla.slaFrtDueAt ?? 0);

  slaEvents.forEach(event => {
    const type = event.eventType?.toUpperCase();
    if (!SLA_TYPES.includes(type)) return;

    const missedAt = type === 'NRT' ? event.createdAt : dueAtByType[type] || event.createdAt;
    if (!missedAt) return;

    slaStatuses.push({
      type,
      threshold: evaluationTime ? missedAt - evaluationTime : null,
      icon: 'flame',
      isSlaMissed: true,
    });
  });

  const hasRecordedFirstResponseMiss = slaEvents.some(
    event => event.eventType?.toUpperCase() === 'FRT',
  );
  const completedFirstResponseEvaluationTime =
    completionTime &&
    !isTerminalSLAStatus(sla.slaStatus) &&
    !hasRecordedFirstResponseMiss &&
    sla.slaFrtDueAt &&
    sla.slaFrtDueAt <= completionTime
      ? completionTime
      : null;
  const firstResponseEvaluationTime = isCompleted
    ? completedFirstResponseEvaluationTime
    : currentTime;

  // FRT is checked until the first reply is made on time. A resolution that
  // arrives before SLA processing uses the completion time to keep the miss.
  if (sla.slaFrtDueAt && shouldCheckFirstResponse && firstResponseEvaluationTime) {
    const threshold = sla.slaFrtDueAt - firstResponseEvaluationTime;
    slaStatuses.push({
      type: 'FRT',
      threshold,
      icon: threshold <= 0 ? 'flame' : 'alarm',
      isSlaMissed: threshold <= 0,
    });
  }

  if (!isCompleted) {
    // NRT applies only after the first reply, while the contact is waiting.
    if (sla.slaNrtDueAt && firstReplyCreatedAt && chat.waitingSince) {
      const threshold = sla.slaNrtDueAt - currentTime;
      slaStatuses.push({
        type: 'NRT',
        threshold,
        icon: threshold <= 0 ? 'flame' : 'alarm',
        isSlaMissed: threshold <= 0,
      });
    }

    if (sla.slaRtDueAt) {
      const threshold = sla.slaRtDueAt - currentTime;
      slaStatuses.push({
        type: 'RT',
        threshold,
        icon: threshold <= 0 ? 'flame' : 'alarm',
        isSlaMissed: threshold <= 0,
      });
    }
  }

  if (slaStatuses.length === 0) return EMPTY_STATUS;

  // Existing breaches come before upcoming deadlines, then the closest timer wins.
  slaStatuses.sort((a, b) => {
    if (a.isSlaMissed !== b.isSlaMissed) return a.isSlaMissed ? -1 : 1;

    if (a.threshold === null || b.threshold === null) {
      if (a.threshold === b.threshold) return 0;
      return a.threshold === null ? -1 : 1;
    }

    return Math.abs(a.threshold) - Math.abs(b.threshold);
  });
  const mostUrgent = slaStatuses[0];

  return {
    type: mostUrgent.type,
    threshold: mostUrgent.threshold === null ? '' : formatSLATime(mostUrgent.threshold),
    icon: mostUrgent.icon,
    isSlaMissed: mostUrgent.isSlaMissed,
  };
};
