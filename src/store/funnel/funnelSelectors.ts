import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { FunnelStage, FunnelStageIdParam } from './funnelTypes';

export const selectFunnelState = (state: RootState) => state.funnel;

export const selectStages = createSelector(selectFunnelState, funnel => funnel.stages);

// Этап по id. Сервер кладёт stage_id диалога в jsonb, откуда он может прийти и числом,
// и строкой — сравниваем через String(), чтобы селектор находил этап в обоих случаях.
export const selectStageById = createSelector(
  [selectStages, (_state: RootState, stageId: number | string) => stageId],
  (stages, stageId) => stages.find((s: FunnelStage) => String(s.id) === String(stageId)),
);

export const selectStageCards = createSelector(
  [selectFunnelState, (_state: RootState, stageId: FunnelStageIdParam) => stageId],
  (funnel, stageId) => funnel.cards[String(stageId)] ?? [],
);

export const selectStageTotal = createSelector(
  [selectFunnelState, (_state: RootState, stageId: FunnelStageIdParam) => stageId],
  (funnel, stageId) => funnel.total[String(stageId)] ?? 0,
);

export const selectStagePage = createSelector(
  [selectFunnelState, (_state: RootState, stageId: FunnelStageIdParam) => stageId],
  (funnel, stageId) => funnel.page[String(stageId)] ?? 0,
);

export const selectIsLoadingStages = createSelector(
  selectFunnelState,
  funnel => funnel.isLoadingStages,
);

export const selectIsLoadingColumn = createSelector(
  selectFunnelState,
  funnel => funnel.isLoadingColumn,
);

export const selectIsUpdating = createSelector(selectFunnelState, funnel => funnel.isUpdating);
