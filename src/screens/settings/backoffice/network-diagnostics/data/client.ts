// data/client.ts
import { getNetworkDiagnosticsUrl } from './config';
import type {
  NetworkCaseStatus, NetworkCasesListParams, NetworkCasesListResponse,
  NetworkStatsResponse, NetworkCaseUpdateStatusResponse, NetworkCaseUpdateCommentResponse,
} from './types';

function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

async function postAction<T extends { success: boolean; error?: string }>(
  token: string, body: Record<string, unknown>, fallback: string,
): Promise<T> {
  const response = await fetch(getNetworkDiagnosticsUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  let data: T | undefined;
  try { data = (await response.json()) as T; } catch { data = undefined; }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  if (!data?.success) {
    throw new Error(data?.error || fallback);
  }
  return data;
}

export function fetchNetworkCases(
  token: string, accountId: number, params: NetworkCasesListParams = {},
): Promise<NetworkCasesListResponse> {
  return postAction<NetworkCasesListResponse>(
    token, compact({ action: 'list', account_id: accountId, ...params }),
    'Failed to list network diagnostic cases.',
  );
}

export function fetchNetworkStats(
  token: string, accountId: number, from?: string, to?: string,
): Promise<NetworkStatsResponse> {
  return postAction<NetworkStatsResponse>(
    token, compact({ action: 'stats', account_id: accountId, from, to }),
    'Failed to load network diagnostic stats.',
  );
}

export function updateNetworkCaseStatus(
  token: string, accountId: number, sk: string, status: NetworkCaseStatus,
): Promise<NetworkCaseUpdateStatusResponse> {
  return postAction<NetworkCaseUpdateStatusResponse>(
    token, { action: 'update_status', account_id: accountId, sk, status },
    'Failed to update case status.',
  );
}

export function updateNetworkCaseComment(
  token: string, accountId: number, sk: string, comentario: string,
): Promise<NetworkCaseUpdateCommentResponse> {
  return postAction<NetworkCaseUpdateCommentResponse>(
    token, { action: 'update_comment', account_id: accountId, sk, comentario },
    'Failed to update case comment.',
  );
}
