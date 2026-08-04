/* eslint-disable import/first -- jest.mock ставим до импортов: шимы нативных модулей должны быть видны глазом раньше кода, который их требует */
/**
 * [conomni] Логика шторки фильтров списка чатов (C5) — источники (мультивыбор) + период,
 * умниковский минимум из двух осей. Чистые функции, вынесенные из ChatListFilterSheet.tsx.
 */
// ChatListFilterSheet.tsx тянет @/components-next/common (барель, вместе с Avatar) →
// @/utils → react-native-keyboard-controller, который падает без нативной линковки в jest
// (см. ChatListRow.spec.ts) — мокаем, тестируемая логика этого модуля не касается.
jest.mock('react-native-keyboard-controller', () => ({ useKeyboardHandler: jest.fn() }));

import {
  resolvePeriodRange,
  toggleInboxSelection,
  buildChatListFilters,
} from '../components/ChatListFilterSheet';

describe('resolvePeriodRange', () => {
  const now = new Date('2026-08-02T12:00:00Z');

  it('период "всё время" → диапазона нет (since/until не заданы)', () => {
    expect(resolvePeriodRange('all', now)).toEqual({});
  });

  it('период "неделя" → непустые since и until, since раньше until', () => {
    const { since, until } = resolvePeriodRange('week', now);
    expect(since).toBeDefined();
    expect(until).toBeDefined();
    expect(typeof since).toBe('number');
    expect(typeof until).toBe('number');
    expect((since as number) < (until as number)).toBe(true);
    // ровно 7 суток в unix-секундах
    expect((until as number) - (since as number)).toBe(7 * 24 * 60 * 60);
  });

  it('период "сегодня" → since на начале текущих суток', () => {
    const { since, until } = resolvePeriodRange('today', now);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    expect(since).toBe(Math.floor(startOfDay.getTime() / 1000));
    expect(until).toBe(Math.floor(now.getTime() / 1000));
  });
});

describe('toggleInboxSelection', () => {
  it('добавляет id, которого не было в выборе', () => {
    expect(toggleInboxSelection([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('убирает id, который уже был выбран', () => {
    expect(toggleInboxSelection([1, 2, 3], 2)).toEqual([1, 3]);
  });
});

describe('buildChatListFilters', () => {
  const now = new Date('2026-08-02T12:00:00Z');

  it('пустой выбор источников и период "всё время" → пустой объект фильтров', () => {
    expect(buildChatListFilters([], 'all', now)).toEqual({});
  });

  it('выбор периода "неделя" кладёт в запрос непустые since/until', () => {
    const filters = buildChatListFilters([], 'week', now);
    expect(filters.since).toBeTruthy();
    expect(filters.until).toBeTruthy();
  });

  it('выбранные источники попадают в inboxIds', () => {
    const filters = buildChatListFilters([1, 5], 'all', now);
    expect(filters.inboxIds).toEqual([1, 5]);
  });
});
