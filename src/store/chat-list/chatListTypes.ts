// [conomni] Слой данных списка чатов — говорит с НАШИМ серверным эндпоинтом ConOmni
// (`conomni/chat_list`), а не со стоковым `/conversations`.

/** Вкладки МОБИЛЬНОГО приложения — НЕ вкладки сервера, см. ServerTab ниже. */
export type ChatListTab = 'new' | 'mine' | 'archive';

/** Вкладка сервера ConOmni — то, что реально уходит параметром `tab` в запросе,
 * и то, что реально приходит полем `tab` в карточке. */
export type ServerTab = 'new' | 'bot' | 'accepted' | 'archive';

export type ChatListSort = 'waiting' | 'price' | 'activity';
export type ChatListDirection = 'asc' | 'desc';

export interface ChatListUrgency {
  level: 'none' | 'warn' | 'hot';
  next_level_at: string | null;
}

export interface ChatListLastMessage {
  content: string;
  message_type: number | null;
}

export interface ChatListContact {
  id: number;
  name: string;
  thumbnail: string;
}

export interface ChatListInbox {
  id: number;
  name: string;
  channel_type: string;
  conomni_channel: string | null;
}

export interface ChatListAssignee {
  id: number;
  name: string;
  thumbnail: string;
}

/** Карточка диалога. `id` — это display_id диалога, первичный ключ сервер наружу не отдаёт. */
export interface Card {
  id: number;
  status: string;
  stage_id: number | string | null;
  price: number | null;
  labels: string[];
  last_activity_at: number | null;
  human_waiting_since: number | null;
  urgency: ChatListUrgency;
  last_message: ChatListLastMessage;
  unread_count: number;
  contact: ChatListContact;
  inbox: ChatListInbox;
  assignee: ChatListAssignee | null;
  bot_answers: boolean;
  tab: ServerTab;
}

export interface ChatListCounters {
  new: number;
  bot: number;
  accepted: number;
  archive: number;
}

/** Необязательные фильтры сверху над параметрами вкладки. Пустые значения на сервер не шлём. */
export interface ChatListQueryFilters {
  inboxIds?: number[];
  since?: number;
  until?: number;
}

/** Параметры запроса `GET conomni/chat_list` — точно как их ждёт сервер (контракт менять нельзя). */
export interface ChatListRequestParams {
  tab: ServerTab;
  page: number;
  sort?: ChatListSort;
  direction?: ChatListDirection;
  include_bot?: 1;
  'assignee_id[]'?: number[];
  'inbox_id[]'?: number[];
  since?: number;
  until?: number;
}

export interface ChatListAPIResponse {
  payload: {
    cards: Card[];
    total: number;
    counters: ChatListCounters;
    bot_inbox_ids: number[];
  };
}

export interface ChatListRowsAPIResponse {
  payload: {
    rows: Card[];
    counters: ChatListCounters;
  };
}

export interface FetchChatListPayload {
  tab: ChatListTab;
  page: number;
  userId: number;
  filters?: ChatListQueryFilters;
}

export interface ChatListResponse {
  tab: ChatListTab;
  page: number;
  cards: Card[];
  total: number;
  counters: ChatListCounters;
}

export interface FetchRowsPayload {
  tab: ChatListTab;
  ids: number[];
}

export interface ChatListRowsResponse {
  tab: ChatListTab;
  requestedIds: number[];
  rows: Card[];
  counters: ChatListCounters;
}

/** C9 «Живое обновление списков»: сокет сигналит «этот display_id изменился» без привязки
 * к конкретной вкладке приложения (ActionCable — не экран, у него нет текущей вкладки).
 * Поэтому, в отличие от FetchRowsPayload/ChatListRowsResponse выше, здесь нет `tab` —
 * один HTTP-запрос `chat_list/rows`, а его результат раскладывается по ВСЕМ трём вкладкам
 * сразу (см. chatListSlice.ts). */
export interface FetchLiveRowsPayload {
  ids: number[];
}

export interface ChatListLiveRowsResponse {
  requestedIds: number[];
  rows: Card[];
  counters: ChatListCounters;
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}
