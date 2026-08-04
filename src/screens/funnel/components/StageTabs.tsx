import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import type {
  FunnelStage,
  FunnelStageIdParam,
  FetchStageColumnPayload,
} from '@/store/funnel/funnelTypes';

/**
 * [conomni] Мобильный паритет, поток C — вкладки этапов воронки. На телефоне воронка не
 * доска (в отличие от веб-кабинета W2), а горизонтальный список вкладок-этапов, как в
 * мобильном Umnico — на узком экране drag&drop доски неудобен (решение Павла,
 * docs/superpowers/specs/2026-08-02-mobile-parity-design.md).
 */

// 'unassigned' — специальное значение сервера для виртуальной колонки «Непринятые»
// (карточки без проставленного этапа); совпадает с FunnelStageIdParam из стора.
export const UNASSIGNED_STAGE_ID: FunnelStageIdParam = 'unassigned';

export interface FunnelTab {
  id: FunnelStageIdParam;
  name: string;
  // Hex этапа с сервера. null — у «Непринятые» своего цвета нет, компонент применяет
  // нейтральный tailwind-класс вместо инлайн-стиля.
  color: string | null;
}

/**
 * Вкладки в порядке position (по возрастанию), «Непринятые» — всегда последней вкладкой
 * (виртуальная колонка, в списке этапов с сервера её нет вовсе).
 */
export function buildFunnelTabs(stages: FunnelStage[]): FunnelTab[] {
  const sorted = [...stages].sort((a, b) => a.position - b.position);
  const tabs: FunnelTab[] = sorted.map(s => ({ id: s.id, name: s.name, color: s.color }));
  tabs.push({
    id: UNASSIGNED_STAGE_ID,
    name: i18n.t('CONOMNI.FUNNEL.UNASSIGNED'),
    color: null,
  });
  return tabs;
}

/**
 * Цвет активной вкладки — hex этапа с сервера, применяется инлайн-стилем (twrnc не
 * резолвит динамически собранные строки классов). Для «Непринятые» цвета нет — null,
 * компонент в этом случае оставляет нейтральный класс.
 */
export function activeTabColor(tab: FunnelTab): string | null {
  return tab.color || null;
}

/**
 * Что грузить при выборе вкладки: первую страницу этого stageId, если колонка ещё не
 * запрашивалась в текущей сессии экрана, иначе null (повторно не дёргаем). Собственного
 * флага «колонка загружена» в сторе нет (total у уже загруженной пустой колонки — тоже
 * легитимный 0, отличить от «ещё не спрашивали» им нельзя) — поэтому список запрошенных
 * ключей (`String(stageId)`) живёт на стороне экрана и передаётся сюда явно.
 *
 * ГРАБЛЯ: функция объявлена здесь, а не в FunnelScreen.tsx, хотя логически принадлежит
 * экрану — `FunnelScreen.tsx` импортирует `@/hooks` (react-redux), а react-redux в этом
 * репозитории резолвится jest'ом в свою ESM-сборку (`exports['react-native']` в
 * package.json пакета) и не транслируется (нет в `transformIgnorePatterns` jest-конфига)
 * → `SyntaxError: Cannot use import statement outside a module` при импорте ЛЮБОГО модуля,
 * который транзитивно тянет `@/hooks`. Это pre-existing дыра инфраструктуры тестов, не
 * специфика этой задачи — почему исправление жёстко привязано только к файлам данной
 * задачи (см. промпт), трогать jest.config.js вне скоупа. Чистые функции без такой
 * зависимости живут в components/*, а не в самом экране.
 */
export function selectStageAction(
  stageId: FunnelStageIdParam,
  loadedStageKeys: Set<string>,
): FetchStageColumnPayload | null {
  if (loadedStageKeys.has(String(stageId))) return null;
  return { stageId, page: 1 };
}

/**
 * Догрузка страницами по 25 (размер страницы задаёт сервер, здесь только счётчик):
 * следующая страница нужна, если карточек загружено меньше total и колонка сейчас не
 * грузится (иначе резвый докрут до низа задвоил бы запрос). См. комментарий над
 * `selectStageAction` — почему эта чистая функция тоже объявлена здесь, а не в
 * FunnelScreen.tsx.
 */
export function nextPagePayload(
  stageId: FunnelStageIdParam,
  loadedCount: number,
  total: number,
  currentPage: number,
  isLoadingColumn: boolean,
): FetchStageColumnPayload | null {
  if (isLoadingColumn) return null;
  if (loadedCount >= total) return null;
  return { stageId, page: currentPage + 1 };
}

export interface StageTabsProps {
  stages: FunnelStage[];
  activeStageId: FunnelStageIdParam;
  onSelect: (stageId: FunnelStageIdParam) => void;
}

export const StageTabs: React.FC<StageTabsProps> = ({ stages, activeStageId, onSelect }) => {
  const tabs = buildFunnelTabs(stages);
  const neutralColor = tailwind.color('gray-700');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={tailwind.style('flex-none border-b border-blackA-A3 bg-white')}
      contentContainerStyle={tailwind.style('flex-row px-4 py-3 gap-6')}>
      {tabs.map(tab => {
        const isActive = String(tab.id) === String(activeStageId);
        const color = isActive ? activeTabColor(tab) || neutralColor : null;

        return (
          <Pressable key={String(tab.id)} onPress={() => onSelect(tab.id)} hitSlop={8}>
            <View style={tailwind.style('items-center')}>
              <Text
                numberOfLines={1}
                style={[
                  tailwind.style(
                    'text-sm tracking-[0.32px]',
                    isActive
                      ? 'font-inter-medium-24 text-gray-950'
                      : 'font-inter-normal-20 text-gray-600',
                  ),
                  isActive && color ? { color } : null,
                ]}>
                {tab.name}
              </Text>
              {isActive ? (
                <View
                  style={[
                    tailwind.style('h-[2px] w-full mt-1 rounded-full'),
                    { backgroundColor: color || neutralColor },
                  ]}
                />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
