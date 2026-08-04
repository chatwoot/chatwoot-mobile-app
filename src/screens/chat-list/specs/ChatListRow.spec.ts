/* eslint-disable import/first -- jest.mock ставим до импортов: шимы нативных модулей должны быть видны глазом раньше кода, который их требует */
/**
 * [conomni] Логика строки списка чатов (C5, поток C мобильного паритета) — чистые функции,
 * вынесенные из ChatListRow.tsx. Рендер-тестов в проекте нет (нет @testing-library),
 * поэтому проверяется именно выбор текста/стиля/параметров, как договорились в задаче.
 */
// ChatListRow.tsx рендерит Avatar (@/components-next/common) → тот тянет весь барель
// @/utils, включая useAppKeyboardAnimation → react-native-keyboard-controller. Библиотека
// требует нативный линковки и падает в jest-окружении ("doesn't seem to be linked"),
// хотя сами тесты этого модуля не касаются — мокаем, чтобы модуль вообще смог загрузиться.
jest.mock('react-native-keyboard-controller', () => ({ useKeyboardHandler: jest.fn() }));

import {
  shouldShowBotAnswersLabel,
  shouldShowUnreadIndicator,
  getRowUrgencyStyle,
  buildChatScreenParams,
  handleRowPress,
} from '../components/ChatListRow';
import { buildCard } from '@/store/chat-list/specs/chatListMockData';

describe('shouldShowBotAnswersLabel', () => {
  it('вкладка "new" + bot_answers:true → показываем подпись', () => {
    const card = buildCard({ bot_answers: true, tab: 'bot' });
    expect(shouldShowBotAnswersLabel(card, 'new')).toBe(true);
  });

  it('вкладка "new" + bot_answers:false → подписи нет', () => {
    const card = buildCard({ bot_answers: false, tab: 'new' });
    expect(shouldShowBotAnswersLabel(card, 'new')).toBe(false);
  });

  it('вкладка "mine" + bot_answers:true → подписи нет (только на "Новых")', () => {
    const card = buildCard({ bot_answers: true, tab: 'accepted' });
    expect(shouldShowBotAnswersLabel(card, 'mine')).toBe(false);
  });
});

describe('shouldShowUnreadIndicator', () => {
  it('unread_count: 0 → индикатора нет', () => {
    expect(shouldShowUnreadIndicator(buildCard({ unread_count: 0 }))).toBe(false);
  });

  it('unread_count > 0 → индикатор есть', () => {
    expect(shouldShowUnreadIndicator(buildCard({ unread_count: 3 }))).toBe(true);
  });
});

describe('getRowUrgencyStyle', () => {
  it('urgency.level:"hot" → класс заливки ruby', () => {
    const card = buildCard({ urgency: { level: 'hot', next_level_at: null } });
    expect(getRowUrgencyStyle(card)).toBe('bg-ruby-100');
  });

  it('urgency.level:"none" → класса заливки нет', () => {
    const card = buildCard({ urgency: { level: 'none', next_level_at: null } });
    expect(getRowUrgencyStyle(card)).toBe('');
  });
});

describe('buildChatScreenParams', () => {
  it('conversationId равен card.id (display_id), пересчитывать не нужно', () => {
    const card = buildCard({ id: 777 });
    expect(buildChatScreenParams(card)).toEqual({ conversationId: 777 });
  });
});

describe('handleRowPress', () => {
  it('тап по строке зовёт навигацию на ChatScreen с conversationId, равным card.id', () => {
    const navigate = jest.fn();
    const card = buildCard({ id: 777 });

    handleRowPress(navigate, card);

    expect(navigate).toHaveBeenCalledWith('ChatScreen', { conversationId: 777 });
  });
});
