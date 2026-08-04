import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { chatListActions } from './chatListActions';
import type { Card, ChatListTab } from './chatListTypes';

export interface ChatListState {
  cards: Record<ChatListTab, Card[]>;
  total: Record<ChatListTab, number>;
  page: Record<ChatListTab, number>;
  isLoading: boolean;
  isLoadingMore: boolean;
  badgeCounters: { new: number; mine: number };
}

const initialState: ChatListState = {
  cards: { new: [], mine: [], archive: [] },
  total: { new: 0, mine: 0, archive: 0 },
  page: { new: 0, mine: 0, archive: 0 },
  isLoading: false,
  isLoadingMore: false,
  badgeCounters: { new: 0, mine: 0 },
};

/** К какой вкладке ПРИЛОЖЕНИЯ относится строка сервера по её РЕАЛЬНОМУ tab.
 * Строка с tab:'bot' остаётся в 'new' — include_bot=1 в запросе не повод её выкидывать. */
const appTabForRow = (rowTab: Card['tab']): ChatListTab | null => {
  if (rowTab === 'new' || rowTab === 'bot') return 'new';
  if (rowTab === 'accepted') return 'mine';
  if (rowTab === 'archive') return 'archive';
  return null;
};

/**
 * Точечно обновляет карточки одной вкладки по ответу `POST chat_list/rows`.
 * Удалять можно ТОЛЬКО те id, что были в requestedIds — за пределами этого списка сервера
 * не спрашивали, трогать их нельзя ни при каких условиях (грабля веба: сигнал вычищал весь
 * список — «строки нет в ответе» значит «вышла из фильтра» ТОЛЬКО для запрошенных id).
 */
const applyRowsToTab = (
  cards: Card[],
  tab: ChatListTab,
  requestedIds: number[],
  rows: Card[],
): Card[] => {
  const requestedSet = new Set(requestedIds);
  const rowById = new Map(rows.map(row => [row.id, row]));

  const kept: Card[] = [];
  cards.forEach(card => {
    if (!requestedSet.has(card.id)) {
      // Не спрашивали про эту карточку — не трогаем.
      kept.push(card);
      return;
    }
    const row = rowById.get(card.id);
    if (!row) {
      // Спросили и не получили строку обратно — из этой вкладки убираем.
      return;
    }
    if (appTabForRow(row.tab) === tab) {
      kept.push(row);
    }
    // Иначе строка сменила вкладку — из текущей удаляется.
  });

  const keptIds = new Set(kept.map(card => card.id));
  rows.forEach(row => {
    if (appTabForRow(row.tab) === tab && !keptIds.has(row.id)) {
      // Строка новая для этой вкладки (её раньше в списке не было) — добавляем.
      kept.push(row);
      keptIds.add(row.id);
    }
  });

  return kept;
};

const chatListSlice = createSlice({
  name: 'chatList',
  initialState,
  reducers: {
    applyRows: (
      state,
      action: PayloadAction<{ tab: ChatListTab; requestedIds: number[]; rows: Card[] }>,
    ) => {
      const { tab, requestedIds, rows } = action.payload;
      state.cards[tab] = applyRowsToTab(state.cards[tab], tab, requestedIds, rows);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(chatListActions.fetchChatList.pending, (state, action) => {
        if (action.meta.arg.page > 1) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
      })
      .addCase(chatListActions.fetchChatList.fulfilled, (state, action) => {
        const { tab, page, cards, total, counters } = action.payload;

        if (page > 1) {
          // Догрузка: складываем, дублей по id быть не должно — Map сохраняет позицию
          // существующих карточек и обновляет их данные, новые добавляются в конец.
          const merged = new Map(state.cards[tab].map(card => [card.id, card] as const));
          cards.forEach(card => merged.set(card.id, card));
          state.cards[tab] = Array.from(merged.values());
        } else {
          state.cards[tab] = cards;
        }

        state.total[tab] = total;
        state.page[tab] = page;
        state.isLoading = false;
        state.isLoadingMore = false;

        // Счётчик "Мои" в бейдж берём именно отсюда (а не из fetchBadgeCounters) —
        // там своя выборка без фильтра ответственного, где counters.accepted не про "мои".
        if (tab === 'mine') {
          state.badgeCounters.mine = counters.accepted;
        }
      })
      .addCase(chatListActions.fetchChatList.rejected, state => {
        state.isLoading = false;
        state.isLoadingMore = false;
      })
      .addCase(chatListActions.fetchRows.fulfilled, (state, action) => {
        const { tab, requestedIds, rows } = action.payload;
        state.cards[tab] = applyRowsToTab(state.cards[tab], tab, requestedIds, rows);
      })
      .addCase(chatListActions.fetchLiveRows.fulfilled, (state, action) => {
        // C9: один ответ `chat_list/rows` — но, в отличие от fetchRows.fulfilled выше,
        // адресован не одной вкладке, а всем трём сразу: ActionCable-сигнал не несёт
        // информации о текущей вкладке строки, применяем ту же чистую applyRowsToTab
        // отдельно к каждой — она трогает только карточки из requestedIds (см. её doc-комментарий).
        const { requestedIds, rows } = action.payload;
        (['new', 'mine', 'archive'] as ChatListTab[]).forEach(tab => {
          state.cards[tab] = applyRowsToTab(state.cards[tab], tab, requestedIds, rows);
        });
      })
      .addCase(chatListActions.fetchBadgeCounters.fulfilled, (state, action) => {
        state.badgeCounters.new = action.payload.counters.new;
      });
  },
});

export const { applyRows } = chatListSlice.actions;
export default chatListSlice.reducer;
