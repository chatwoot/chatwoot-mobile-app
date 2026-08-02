/**
 * [conomni] Шторка фильтров списка чатов (C5) — умниковский минимум: ДВЕ оси, источники
 * (мультивыбор) и период. Логика выбора значений вынесена в чистые функции (тестируются
 * напрямую, рендер-тестов в проекте нет — нет @testing-library).
 *
 * Список источников приходит ПРОПОМ (`inboxes`), а не через `useAppSelector` изнутри —
 * осознанно: любой модуль, тянущий `@/hooks` (react-redux), падает при импорте в jest
 * этого проекта ("Cannot use import statement outside a module" на ESM-сборке react-redux,
 * см. тот же приём в src/screens/funnel/components/StageTabs.tsx). Чтобы спека могла
 * импортировать чистые функции этого файла напрямую, компонент держим "глупым".
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';

import { BottomSheetHeader, Icon } from '@/components-next/common';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import type { ChatListQueryFilters } from '@/store/chat-list/chatListTypes';

export type ChatListPeriod = 'all' | 'today' | 'week' | 'month';

export const PERIOD_OPTIONS: ChatListPeriod[] = ['all', 'today', 'week', 'month'];

const PERIOD_LABEL_KEYS: Record<ChatListPeriod, string> = {
  all: 'CONOMNI.CHAT_LIST.FILTER_PERIOD_ALL',
  today: 'CONOMNI.CHAT_LIST.FILTER_PERIOD_TODAY',
  week: 'CONOMNI.CHAT_LIST.FILTER_PERIOD_WEEK',
  month: 'CONOMNI.CHAT_LIST.FILTER_PERIOD_MONTH',
};

/**
 * Границы периода в unix-секундах. "Всё время" — диапазона нет вовсе (пустой объект),
 * сервер не получает since/until. `now` параметризован ради детерминированных тестов.
 */
export function resolvePeriodRange(
  period: ChatListPeriod,
  now: Date = new Date(),
): { since?: number; until?: number } {
  if (period === 'all') return {};

  const until = Math.floor(now.getTime() / 1000);
  const start = new Date(now);

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    start.setDate(start.getDate() - 7);
  } else if (period === 'month') {
    start.setMonth(start.getMonth() - 1);
  }

  const since = Math.floor(start.getTime() / 1000);
  return { since, until };
}

/** Переключение id источника в множестве выбранных — добавляет отсутствующий, убирает выбранный. */
export function toggleInboxSelection(selected: number[], id: number): number[] {
  return selected.includes(id)
    ? selected.filter(existingId => existingId !== id)
    : [...selected, id];
}

/** Собирает фильтры запроса `conomni/chat_list` из выбора шторки. Пустые оси в объект не попадают. */
export function buildChatListFilters(
  selectedInboxIds: number[],
  period: ChatListPeriod,
  now: Date = new Date(),
): ChatListQueryFilters {
  const filters: ChatListQueryFilters = {};
  if (selectedInboxIds.length > 0) {
    filters.inboxIds = selectedInboxIds;
  }

  const range = resolvePeriodRange(period, now);
  if (range.since) filters.since = range.since;
  if (range.until) filters.until = range.until;

  return filters;
}

export interface ChatListFilterSheetInbox {
  id: number;
  name: string;
}

export interface ChatListFilterSheetProps {
  inboxes: ChatListFilterSheetInbox[];
  initialInboxIds?: number[];
  initialPeriod?: ChatListPeriod;
  onApply: (filters: ChatListQueryFilters) => void;
  onReset: () => void;
}

export const ChatListFilterSheet: React.FC<ChatListFilterSheetProps> = ({
  inboxes,
  initialInboxIds = [],
  initialPeriod = 'all',
  onApply,
  onReset,
}) => {
  const [selectedInboxIds, setSelectedInboxIds] = useState<number[]>(initialInboxIds);
  const [period, setPeriod] = useState<ChatListPeriod>(initialPeriod);

  const handleApply = () => {
    onApply(buildChatListFilters(selectedInboxIds, period));
  };

  const handleReset = () => {
    setSelectedInboxIds([]);
    setPeriod('all');
    onReset();
  };

  return (
    <BottomSheetView>
      <BottomSheetHeader headerText={i18n.t('CONOMNI.CHAT_LIST.FILTERS')} />

      <View style={tailwind.style('px-3 pt-2')}>
        <Text style={tailwind.style('text-sm text-gray-600 font-inter-medium-24 mb-1')}>
          {i18n.t('CONOMNI.CHAT_LIST.FILTER_CHANNELS')}
        </Text>
        <ScrollView style={tailwind.style('max-h-[160px]')} nestedScrollEnabled>
          {inboxes.map(inbox => {
            const isSelected = selectedInboxIds.includes(inbox.id);
            return (
              <Pressable
                key={inbox.id}
                onPress={() => setSelectedInboxIds(prev => toggleInboxSelection(prev, inbox.id))}
                style={tailwind.style(
                  'flex-row items-center justify-between py-[11px] border-b-[1px] border-blackA-A3',
                )}>
                <Text style={tailwind.style('text-base text-gray-950 font-inter-420-20')}>
                  {inbox.name}
                </Text>
                {isSelected ? <Icon icon={<TickIcon />} size={20} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={tailwind.style('text-sm text-gray-600 font-inter-medium-24 mt-3 mb-1')}>
          {i18n.t('CONOMNI.CHAT_LIST.FILTER_PERIOD')}
        </Text>
        {PERIOD_OPTIONS.map(option => (
          <Pressable
            key={option}
            onPress={() => setPeriod(option)}
            style={tailwind.style(
              'flex-row items-center justify-between py-[11px] border-b-[1px] border-blackA-A3',
            )}>
            <Text style={tailwind.style('text-base text-gray-950 font-inter-420-20')}>
              {i18n.t(PERIOD_LABEL_KEYS[option])}
            </Text>
            {period === option ? <Icon icon={<TickIcon />} size={20} /> : null}
          </Pressable>
        ))}

        <View style={tailwind.style('flex-row gap-3 py-4')}>
          <Pressable
            onPress={handleReset}
            style={tailwind.style('flex-1 items-center py-3 rounded-lg bg-gray-100')}>
            <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
              {i18n.t('CONOMNI.CHAT_LIST.FILTER_RESET')}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleApply}
            style={tailwind.style('flex-1 items-center py-3 rounded-lg bg-teal-700')}>
            <Text style={tailwind.style('text-base font-inter-medium-24 text-white')}>
              {i18n.t('CONOMNI.CHAT_LIST.FILTER_APPLY')}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetView>
  );
};

export default ChatListFilterSheet;
