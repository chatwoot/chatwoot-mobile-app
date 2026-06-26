// data/format.ts
import type {
  NetworkCase,
  NetworkCaseStatus,
  NetworkOutcome,
  NetworkCaseEditEntry,
  NetworkDayBucket,
} from './types';

export function caseStatus(item: NetworkCase): NetworkCaseStatus {
  return item.status === 'resolvido' ? 'resolvido' : 'pendente';
}

export function outcomeLabelKey(outcome?: NetworkOutcome): string {
  switch (outcome) {
    case 'instavel_transferido_suporte':
      return 'NETWORK_DIAGNOSTICS.OUTCOME_INSTAVEL';
    case 'offline_transferido_suporte':
      return 'NETWORK_DIAGNOSTICS.OUTCOME_OFFLINE';
    case 'problema_conexao_observado':
      return 'NETWORK_DIAGNOSTICS.OUTCOME_CONEXAO';
    default:
      return outcome || '—';
  }
}

export function outcomeTone(outcome?: NetworkOutcome): 'warning' | 'danger' | 'info' | 'neutral' {
  switch (outcome) {
    case 'instavel_transferido_suporte':
      return 'warning';
    case 'offline_transferido_suporte':
      return 'danger';
    case 'problema_conexao_observado':
      return 'info';
    default:
      return 'neutral';
  }
}

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function caseDate(item: NetworkCase): string {
  const raw = item.created_at || item.sk?.split('#')[0];
  if (!raw) return '—';
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? '—' : DATE_FMT.format(d);
}

export function parseEditHistory(raw?: string): NetworkCaseEditEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NetworkCaseEditEntry[]) : [];
  } catch {
    return [];
  }
}

/** `YYYY-MM-DD` for `daysAgo` before today, in local time. */
export function isoDate(daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

const EMPTY_BUCKET = (date: string): NetworkDayBucket => ({
  date,
  total: 0,
  instaveis: 0,
  offline: 0,
  conexao_observada: 0,
  transferido: 0,
});

/** One ascending bucket per day in [from, to], filling gaps with zeros. */
export function zeroFillByDay(
  from: string,
  to: string,
  buckets: NetworkDayBucket[] = [],
): NetworkDayBucket[] {
  const bySorted = new Map(buckets.map(b => [b.date, b]));
  const out: NetworkDayBucket[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [...buckets].sort((a, b) => a.date.localeCompare(b.date));
  }
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    out.push(bySorted.get(key) ?? EMPTY_BUCKET(key));
  }
  return out;
}
