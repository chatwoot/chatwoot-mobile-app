// data/types.ts — ported from backoffice/src/types/network-diagnostics.ts
export type NetworkOutcome =
  | 'instavel_transferido_suporte'
  | 'offline_transferido_suporte'
  | 'problema_conexao_observado'
  | (string & {});

export type NetworkCaseStatus = 'pendente' | 'resolvido';

export interface NetworkCase {
  account_id: number;
  sk: string;
  created_at?: string;
  analyzed_at?: string;
  outcome?: NetworkOutcome;
  cliente_nome?: string;
  username?: string;
  id_login?: number;
  id_cliente?: number;
  id_contrato?: number;
  cnpj_cpf?: string;
  plano?: string;
  cidade?: string;
  transferido?: boolean;
  connection_issue_observed?: boolean;
  connection_issue_reason?: string;
  is_unstable?: boolean;
  is_currently_offline?: boolean;
  churn_risk?: boolean;
  conversation_id?: number;
  status?: NetworkCaseStatus;
  status_updated_at?: string;
  comentario?: string;
  comentario_updated_at?: string;
  edit_history?: string;
  [key: string]: unknown;
}

export interface NetworkCaseEditEntry {
  at: string;
  by?: string;
  action: 'status' | 'comentario';
  to?: NetworkCaseStatus;
}

export type BoolFilter = '' | 'true' | 'false';
export type StatusFilter = '' | NetworkCaseStatus;

export interface NetworkCasesListParams {
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
  outcome?: NetworkOutcome;
  transferido?: boolean;
  connection_issue_observed?: boolean;
  churn_risk?: boolean;
  status?: NetworkCaseStatus;
}

export interface NetworkCasesListResponse {
  success: boolean;
  items: NetworkCase[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_more: boolean;
  error?: string;
}

export interface NetworkDayBucket {
  date: string;
  total: number;
  instaveis: number;
  offline: number;
  conexao_observada: number;
  transferido?: number;
}

export interface NetworkStats {
  total: number;
  by_outcome: Record<string, number>;
  transferidos: number;
  conexao_observada: number;
  instaveis: number;
  offline: number;
  churn_risk?: number;
  resolvidos?: number;
  pendentes?: number;
  by_day?: NetworkDayBucket[];
}

export interface NetworkStatsResponse {
  success: boolean;
  stats: NetworkStats;
  error?: string;
}

export interface NetworkCaseUpdateStatusResponse {
  success: boolean;
  item: NetworkCase;
  error?: string;
}

export interface NetworkCaseUpdateCommentResponse {
  success: boolean;
  item: NetworkCase;
  error?: string;
}
