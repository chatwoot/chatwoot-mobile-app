// [conomni] C9 «Живое обновление списков» (поток C мобильного паритета).
//
// ActionCable-события (`conversation.created`, `conversation.status_changed`,
// `conversation.read`, `assignee.changed`, `message.created`) несут НЕ карточку списка —
// в их полезной нагрузке нет ни `urgency`, ни `conomni_channel` (грабля W5). Поэтому строку
// из события не собираем: событие — только сигнал «этот display_id изменился». Копим id и
// раз в 3 секунды одним запросом дёргаем `fetchRows` — три события подряд по одному id
// обязаны свернуться в ОДИН запрос.
//
// Модуль сознательно не знает ни про Redux, ни про ActionCable — только таймер и Set id,
// чтобы копилку можно было тестировать без стора и без сети (см. specs/chatListLiveUpdates.spec.ts).

export const LIVE_UPDATE_FLUSH_MS = 3000;

export type ChatListLiveUpdatesFlush = (ids: number[]) => void;

export interface ChatListLiveUpdatesConfig {
  onFlush: ChatListLiveUpdatesFlush;
  flushMs?: number;
}

export interface ChatListLiveUpdates {
  /** Регистрирует «этот display_id изменился». Идемпотентно копит id до ближайшего флаша —
   * повторная регистрация того же id новых запросов не добавляет. */
  registerConversationId: (conversationId: number) => void;
  /** Снимает таймер и сбрасывает накопленное. Обязателен при отключении сокета — иначе
   * таймер продолжает тикать в фоне (§7 спеки волны, «течь таймерами нельзя»). */
  stop: () => void;
}

export const createChatListLiveUpdates = ({
  onFlush,
  flushMs = LIVE_UPDATE_FLUSH_MS,
}: ChatListLiveUpdatesConfig): ChatListLiveUpdates => {
  let pendingIds = new Set<number>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = (): void => {
    timer = null;
    if (pendingIds.size === 0) return;
    const ids = Array.from(pendingIds);
    pendingIds = new Set<number>();
    onFlush(ids);
  };

  const registerConversationId = (conversationId: number): void => {
    pendingIds.add(conversationId);
    // Таймер взводится только на ПЕРВОЕ событие партии — это фиксированное окно
    // батчинга "раз в 3 секунды", а не скользящий дебаунс, который сдвигался бы на каждое
    // новое событие и мог бы никогда не выстрелить под непрерывным потоком событий.
    if (timer === null) {
      timer = setTimeout(flush, flushMs);
    }
  };

  const stop = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    pendingIds = new Set<number>();
  };

  return { registerConversationId, stop };
};
