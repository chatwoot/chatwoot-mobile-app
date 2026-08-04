// Слой данных воронки продаж. В ConOmni «сделка == диалог»: этап и цена лежат на самом
// диалоге (`conversations.custom_attributes`), отдельной сущности сделки нет — см.
// docs/superpowers/specs/2026-07-31-umnico-parity-w2-funnel-design.md в основном репо.
// Имена полей повторяют JSON сервера как есть (snake_case), без camelCase-трансформации —
// так же, как типы auth/team, а не как conversation (тому нужен отдельный camelCaseKeys).

export type FunnelStageKind = 'normal' | 'won' | 'lost';

export interface FunnelStage {
  id: number;
  name: string;
  color: string; // '#RRGGBB'
  position: number;
  kind: FunnelStageKind;
  conversations_count: number;
}

export type FunnelUrgencyLevel = 'none' | 'warn' | 'hot';

export interface FunnelCardUrgency {
  level: FunnelUrgencyLevel;
  next_level_at: string | null;
}

export interface FunnelCardContact {
  id: number;
  name: string;
  thumbnail: string;
}

export interface FunnelCardInbox {
  id: number;
  name: string;
  channel_type: string;
  conomni_channel: string | null;
}

export interface FunnelCardAssignee {
  id: number;
  name: string;
  thumbnail: string;
}

// ВНИМАНИЕ (грабля W5, актуальна и здесь): карточка ВОРОНКИ — это НЕ карточка списка
// чатов. У карточки списка `last_message` — объект `{content, message_type}`, есть
// `unread_count`/`bot_answers`/`tab`/`human_waiting_since`. У карточки воронки
// `last_message` — просто СТРОКА, и этих полей нет вовсе. Ответ PATCH ниже — карточка
// воронки; раскладывать её целиком в стор списка чатов нельзя, оттуда берут только
// `stage_id` и `price`.
export interface FunnelCard {
  id: number; // display_id диалога
  display_id: number;
  status: string;
  stage_id: number | string | null;
  price: number | null;
  labels: string[];
  last_activity_at: number | null; // unix-секунды
  urgency: FunnelCardUrgency;
  last_message: string;
  contact: FunnelCardContact;
  inbox: FunnelCardInbox;
  assignee: FunnelCardAssignee | null;
}

// 'unassigned' — специальное значение сервера для колонки «Непринятые» (карточки без
// проставленного этапа).
export type FunnelStageIdParam = number | 'unassigned';

export interface FunnelStagesAPIResponse {
  payload: FunnelStage[];
}

export interface FunnelStageColumnAPIResponse {
  payload: {
    total: number;
    cards: FunnelCard[];
  };
}

export interface FunnelUpdateConversationAPIResponse {
  payload: FunnelCard;
}

export interface FetchStageColumnPayload {
  stageId: FunnelStageIdParam;
  page: number;
}

export interface FetchStageColumnResult {
  stageId: FunnelStageIdParam;
  page: number;
  total: number;
  cards: FunnelCard[];
}

// stageId/price опциональны НЕЗАВИСИМО друг от друга и различают «не передано» (ключ
// отсутствует в теле запроса) от «передано null» (стереть этап). Непереданный stageId
// не должен уехать на сервер как null — это стёрло бы этап диалога.
// stageId — `number | string`, а не только `number`: справочник этапов (funnelSelectors)
// отдаёт числовой id, а `conversation.customAttributes.conomni_stage_id` (задача C7) —
// строку из jsonb; сервер принимает оба варианта одинаково.
export interface UpdateConversationFunnelPayload {
  conversationId: number;
  stageId?: number | string | null;
  price?: number | string;
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}
