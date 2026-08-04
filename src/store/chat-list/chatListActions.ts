import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ChatListService } from './chatListService';
import type {
  ChatListTab,
  ChatListQueryFilters,
  ChatListRequestParams,
  ChatListResponse,
  ChatListRowsResponse,
  ChatListCounters,
  FetchChatListPayload,
  FetchRowsPayload,
  FetchLiveRowsPayload,
  ChatListLiveRowsResponse,
  ApiErrorResponse,
} from './chatListTypes';

/**
 * Переводит вкладку МОБИЛЬНОГО приложения в параметры запроса сервера ConOmni.
 * Вкладки приложения (new/mine/archive) — НЕ вкладки сервера (new/bot/accepted/archive).
 * Пустые фильтры на сервер не шлём — только непустые ключи попадают в результат.
 */
export const buildChatListParams = (
  tab: ChatListTab,
  { userId, page, filters }: { userId: number; page: number; filters?: ChatListQueryFilters },
): ChatListRequestParams => {
  const params: ChatListRequestParams = (() => {
    switch (tab) {
      case 'new':
        return { tab: 'new', include_bot: 1, sort: 'waiting', direction: 'asc', page };
      case 'mine':
        return {
          tab: 'accepted',
          'assignee_id[]': [userId],
          sort: 'waiting',
          direction: 'asc',
          page,
        };
      case 'archive':
      default:
        return { tab: 'archive', sort: 'activity', direction: 'desc', page };
    }
  })();

  if (filters?.inboxIds && filters.inboxIds.length > 0) {
    params['inbox_id[]'] = filters.inboxIds;
  }
  if (filters?.since) {
    params.since = filters.since;
  }
  if (filters?.until) {
    params.until = filters.until;
  }

  return params;
};

export const chatListActions = {
  fetchChatList: createAsyncThunk<ChatListResponse, FetchChatListPayload>(
    'chatList/fetchChatList',
    async ({ tab, page, userId, filters }, { rejectWithValue }) => {
      try {
        const params = buildChatListParams(tab, { userId, page, filters });
        const { cards, total, counters } = await ChatListService.fetchChatList(params);
        return { tab, page, cards, total, counters };
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  fetchRows: createAsyncThunk<ChatListRowsResponse, FetchRowsPayload>(
    'chatList/fetchRows',
    async ({ tab, ids }, { rejectWithValue }) => {
      try {
        const { rows, counters } = await ChatListService.fetchRows(ids);
        return { tab, requestedIds: ids, rows, counters };
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  // C9 «Живое обновление списков»: ActionCable-накопитель (chatListLiveUpdates.ts) копит
  // display_id по сигналам сокета и раз в 3с зовёт это ОДНОГО тонка — без параметра tab,
  // потому что сокет глобальный и не знает, какая вкладка сейчас открыта. Результат этого
  // единственного HTTP-запроса раскладывается по всем вкладкам в chatListSlice.ts.
  fetchLiveRows: createAsyncThunk<ChatListLiveRowsResponse, FetchLiveRowsPayload>(
    'chatList/fetchLiveRows',
    async ({ ids }, { rejectWithValue }) => {
      try {
        const { rows, counters } = await ChatListService.fetchRows(ids);
        return { requestedIds: ids, rows, counters };
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  // Лёгкий запрос для бейджей меню: всегда вкладка "new" сервера БЕЗ фильтра ответственного.
  // Счётчик вкладки "Мои" в бейдж не берём отсюда — счётчики /chat_list считаются под фильтром
  // запроса, а фильтра ответственного здесь нет; badgeCounters.mine приходит из fetchChatList('mine').
  fetchBadgeCounters: createAsyncThunk<{ counters: ChatListCounters }, void>(
    'chatList/fetchBadgeCounters',
    async (_arg, { rejectWithValue }) => {
      try {
        const { counters } = await ChatListService.fetchChatList({
          tab: 'new',
          include_bot: 1,
          page: 1,
        });
        return { counters };
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
};
