/**
 * [conomni] Шапка экрана списка чатов (C5) — заголовок вкладки, колокольчик уведомлений
 * и кнопка фильтра. Компонент "глупый": колокольчик и фильтр отдаются наружу колбэками
 * (`onNotificationsPress`/`onFilterPress`), а не зовут `useNavigation()` сами — по той же
 * причине, что и у ChatListFilterSheet.tsx: любой модуль, тянущий хуки навигации/редакса на
 * уровне импорта, рискует утащить за собой `@/hooks` через транзитивные зависимости и не
 * загрузится в jest. Здесь же, ради тестируемости, живут чистые функции, которые по смыслу
 * принадлежат ЭКРАНУ целиком (не только шапке) — `ChatListScreen.tsx` не даёт их
 * протестировать напрямую: он импортирует `@/hooks` (react-redux) и его модульный граф
 * падает при загрузке в jest этого проекта ("Cannot use import statement outside a module"
 * на ESM-сборке react-redux) — тот же приём применён в
 * src/screens/funnel/components/StageTabs.tsx (см. комментарий там же).
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components-next/common';
import { InboxFilterIcon } from '@/svg-icons';
import { InboxIconOutline } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import type { ChatListTab } from '@/store/chat-list/chatListTypes';

const TITLE_KEYS: Record<ChatListTab, string> = {
  new: 'CONOMNI.CHAT_LIST.TITLE_NEW',
  mine: 'CONOMNI.CHAT_LIST.TITLE_MINE',
  archive: 'CONOMNI.CHAT_LIST.TITLE_ARCHIVE',
};

const EMPTY_STATE_KEYS: Record<ChatListTab, string> = {
  new: 'CONOMNI.CHAT_LIST.EMPTY_NEW',
  mine: 'CONOMNI.CHAT_LIST.EMPTY_MINE',
  archive: 'CONOMNI.CHAT_LIST.EMPTY_ARCHIVE',
};

const VALID_TABS: ChatListTab[] = ['new', 'mine', 'archive'];

/** Ключ локали заголовка по вкладке приложения. */
export function getHeaderTitleKey(tab: ChatListTab): string {
  return TITLE_KEYS[tab];
}

/** Ключ локали пустого состояния по вкладке приложения. */
export function getEmptyStateKey(tab: ChatListTab): string {
  return EMPTY_STATE_KEYS[tab];
}

/**
 * Вкладка приложения из параметра роута (`route.params.tab`). Безопасный дефолт — 'new':
 * параметр может отсутствовать (прямой заход) или прийти мусором, экран не должен падать.
 */
export function resolveRouteTab(paramTab: unknown): ChatListTab {
  return VALID_TABS.includes(paramTab as ChatListTab) ? (paramTab as ChatListTab) : 'new';
}

/** Нужно ли грузить следующую страницу списка (onEndReached FlashList). */
export function shouldLoadMore(
  loadedCount: number,
  total: number,
  isLoadingMore: boolean,
): boolean {
  return !isLoadingMore && loadedCount < total;
}

export interface ChatListHeaderProps {
  tab: ChatListTab;
  onNotificationsPress: () => void;
  onFilterPress: () => void;
}

export const ChatListHeader: React.FC<ChatListHeaderProps> = ({
  tab,
  onNotificationsPress,
  onFilterPress,
}) => {
  return (
    <View
      style={tailwind.style(
        'flex-row justify-between items-center px-4 pt-2 pb-[12px] border-b-[1px] border-b-blackA-A3',
      )}>
      <View style={tailwind.style('flex-1')}>
        <Pressable hitSlop={16} onPress={onNotificationsPress}>
          <Icon icon={<InboxIconOutline />} size={24} />
        </Pressable>
      </View>
      <View style={tailwind.style('flex-1')}>
        <Text
          style={tailwind.style(
            'text-[17px] text-center leading-[17px] tracking-[0.32px] font-inter-medium-24 text-gray-950',
          )}>
          {i18n.t(getHeaderTitleKey(tab))}
        </Text>
      </View>
      <View style={tailwind.style('flex-1 items-end')}>
        <Pressable hitSlop={16} onPress={onFilterPress}>
          <Icon icon={<InboxFilterIcon />} size={24} />
        </Pressable>
      </View>
    </View>
  );
};

export default ChatListHeader;
