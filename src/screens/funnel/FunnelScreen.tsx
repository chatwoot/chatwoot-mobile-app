import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { funnelActions } from '@/store/funnel/funnelActions';
import {
  selectStages,
  selectStageCards,
  selectStageTotal,
  selectStagePage,
  selectIsLoadingStages,
  selectIsLoadingColumn,
} from '@/store/funnel/funnelSelectors';
import type { FunnelCard, FunnelStageIdParam } from '@/store/funnel/funnelTypes';
import {
  StageTabs,
  buildFunnelTabs,
  selectStageAction,
  nextPagePayload,
  UNASSIGNED_STAGE_ID,
} from './components/StageTabs';
import { FunnelCardRow } from './components/FunnelCardRow';

/**
 * [conomni] Мобильный паритет, поток C — экран «Воронка»: вкладки-этапы + список карточек
 * внутри активной вкладки (НЕ доска с перетаскиванием — см. StageTabs.tsx, решение Павла
 * зафиксировано в docs/superpowers/specs/2026-08-02-mobile-parity-design.md). Смена этапа
 * карточки в этой задаче не делается — только просмотр и переход в диалог.
 * Регистрация экрана в навигаторе — отдельная задача волны, здесь только сам экран.
 *
 * Чистые функции `selectStageAction`/`nextPagePayload` (что грузить при выборе вкладки и
 * при догрузке страницы) объявлены и тестируются в `./components/StageTabs.tsx`, а не
 * здесь — см. комментарий у `selectStageAction` в том файле: этот модуль импортирует
 * `@/hooks` (react-redux), а его тянуть в jest нельзя (ESM-сборка react-redux не
 * транслируется текущим jest-конфигом, вне скоупа этой задачи).
 */

const FunnelScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const stages = useAppSelector(selectStages);
  const isLoadingStages = useAppSelector(selectIsLoadingStages);
  const isLoadingColumn = useAppSelector(selectIsLoadingColumn);

  const [activeStageId, setActiveStageId] = useState<FunnelStageIdParam | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Ключи колонок, которые уже запрашивались в этой сессии экрана (переживает переключение
  // вкладок туда-обратно; сбрасывается только пересозданием экрана).
  const loadedStageKeysRef = useRef<Set<string>>(new Set());

  const cards = useAppSelector(state =>
    activeStageId === null ? [] : selectStageCards(state, activeStageId),
  );
  const total = useAppSelector(state =>
    activeStageId === null ? 0 : selectStageTotal(state, activeStageId),
  );
  const page = useAppSelector(state =>
    activeStageId === null ? 0 : selectStagePage(state, activeStageId),
  );

  useEffect(() => {
    dispatch(funnelActions.fetchStages());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Первая вкладка выбирается, как только пришли этапы (buildFunnelTabs всегда возвращает
  // хотя бы «Непринятые», даже если в аккаунте нет ни одного настоящего этапа).
  useEffect(() => {
    if (activeStageId !== null || isLoadingStages) return;

    const firstTab = buildFunnelTabs(stages)[0];
    const action = selectStageAction(firstTab.id, loadedStageKeysRef.current);
    setActiveStageId(firstTab.id);
    if (action) {
      loadedStageKeysRef.current.add(String(action.stageId));
      dispatch(funnelActions.fetchStageColumn(action));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages, isLoadingStages, activeStageId]);

  const handleSelectStage = useCallback(
    (stageId: FunnelStageIdParam) => {
      setActiveStageId(stageId);
      const action = selectStageAction(stageId, loadedStageKeysRef.current);
      if (action) {
        loadedStageKeysRef.current.add(String(action.stageId));
        dispatch(funnelActions.fetchStageColumn(action));
      }
    },
    [dispatch],
  );

  const handleEndReached = useCallback(() => {
    if (activeStageId === null) return;
    const action = nextPagePayload(activeStageId, cards.length, total, page, isLoadingColumn);
    if (action) {
      dispatch(funnelActions.fetchStageColumn(action));
    }
  }, [activeStageId, cards.length, total, page, isLoadingColumn, dispatch]);

  const handleRefresh = useCallback(() => {
    if (activeStageId === null) return;
    setIsRefreshing(true);
    loadedStageKeysRef.current.add(String(activeStageId));
    dispatch(funnelActions.fetchStageColumn({ stageId: activeStageId, page: 1 })).finally(() => {
      setIsRefreshing(false);
    });
  }, [activeStageId, dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: FunnelCard }) => <FunnelCardRow card={item} />,
    [],
  );

  const showEmptyLoader =
    (isLoadingStages || (isLoadingColumn && cards.length === 0)) && !isRefreshing;

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <View style={tailwind.style('px-4 py-3')}>
        <Text style={tailwind.style('text-lg font-inter-medium-24 text-gray-950')}>
          {i18n.t('CONOMNI.FUNNEL.TITLE')}
        </Text>
      </View>
      <StageTabs
        stages={stages}
        activeStageId={activeStageId ?? UNASSIGNED_STAGE_ID}
        onSelect={handleSelectStage}
      />
      {showEmptyLoader ? (
        <View style={tailwind.style('flex-1 items-center justify-center')}>
          <ActivityIndicator />
        </View>
      ) : cards.length === 0 ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={tailwind.style('flex-1 items-center justify-center py-16')}>
          <Text style={tailwind.style('text-sm text-gray-600')}>
            {i18n.t('CONOMNI.FUNNEL.EMPTY_STAGE')}
          </Text>
        </ScrollView>
      ) : (
        <FlashList<FunnelCard>
          data={cards}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          estimatedItemSize={76}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingColumn && !isRefreshing ? (
              <View style={tailwind.style('py-4 items-center')}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default FunnelScreen;
