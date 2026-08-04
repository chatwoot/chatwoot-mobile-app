/**
 * [conomni] Мобильный паритет, поток C (C4) — чистая логика `ChatListStack.tsx`, вынесенная
 * в отдельный файл по той же причине, что и `ChatListHeader.tsx`/`StageTabs.tsx`:
 * `ChatListStack.tsx` импортирует настоящий `ChatListScreen` (C5), а тот транзитивно тянет
 * `react-native-keyboard-controller` (через `src/components-next`) — нативный модуль,
 * который в jest этого проекта не линкуется и падает при загрузке. Функция здесь
 * протестирована напрямую в `./specs/ChatListStack.spec.ts`.
 */
import type { ChatListTab } from '@/store/chat-list/chatListTypes';

export const DEFAULT_CHAT_LIST_TAB: ChatListTab = 'new';

/** Вкладка стека из параметра таба — защитный дефолт «Новые» при прямом заходе без параметра. */
export function resolveInitialChatListTab(paramTab: ChatListTab | undefined): ChatListTab {
  return paramTab ?? DEFAULT_CHAT_LIST_TAB;
}
