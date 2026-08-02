import type { Card, ChatListCounters } from '../chatListTypes';

// [conomni] Минимальная валидная карточка списка чатов для тестов — поля переопределяются
// точечно через overrides, чтобы каждый тест не тащил весь контракт Card целиком.
export const buildCard = (overrides: Partial<Card> = {}): Card => ({
  id: 1,
  status: 'open',
  stage_id: null,
  price: null,
  labels: [],
  last_activity_at: 1700000000,
  human_waiting_since: null,
  urgency: { level: 'none', next_level_at: null },
  last_message: { content: 'привет', message_type: 0 },
  unread_count: 0,
  contact: { id: 10, name: 'Клиент', thumbnail: '' },
  inbox: { id: 1, name: 'MAX', channel_type: 'Channel::Api', conomni_channel: 'max' },
  assignee: null,
  bot_answers: false,
  tab: 'new',
  ...overrides,
});

export const buildCounters = (overrides: Partial<ChatListCounters> = {}): ChatListCounters => ({
  new: 0,
  bot: 0,
  accepted: 0,
  archive: 0,
  ...overrides,
});
