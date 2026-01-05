import type { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { kanbanItemsSelectors } from './kanbanSlice';

const selectKanbanState = (state: RootState) => state.kanban;

// Seletores seguros para items (verificam se items existe)
const selectKanbanItemsState = createSelector([selectKanbanState], kanban => kanban?.items);

export const selectKanbanFunnels = createSelector(
  [selectKanbanState],
  kanban => kanban?.funnels || [],
);

export const selectCurrentKanbanFunnel = createSelector(
  [selectKanbanState],
  kanban => kanban?.currentFunnel || null,
);

export const selectKanbanIsLoading = createSelector(
  [selectKanbanState],
  kanban => kanban?.isLoading || false,
);

export const selectKanbanError = createSelector(
  [selectKanbanState],
  kanban => kanban?.error || null,
);

export const selectCurrentKanbanItem = createSelector(
  [selectKanbanState],
  kanban => kanban?.currentItem || null,
);

export const selectKanbanStages = createSelector(
  [selectCurrentKanbanFunnel],
  funnel => (Array.isArray(funnel?.stages) ? funnel.stages : []) || [],
);

// Selector memoizado para items de um stage específico
export const selectKanbanItemsByStage = createSelector(
  [selectCurrentKanbanFunnel, (_state: RootState, stageKey: string) => stageKey],
  (funnel, stageKey) => {
    if (!funnel?.stages) return [];

    const stages = Array.isArray(funnel.stages) ? funnel.stages : [];
    const stage = stages.find(s => s.stage_key === stageKey);

    return stage?.items || [];
  },
);

// Selector seguro para todos os items
export const selectAllKanbanItems = createSelector([selectKanbanItemsState], itemsState => {
  if (!itemsState) return [];
  return kanbanItemsSelectors.selectAll({ kanban: { items: itemsState } } as RootState);
});

// Selector seguro para item por ID
export const selectKanbanItemById = (state: RootState, itemId: number) => {
  const itemsState = selectKanbanItemsState(state);
  if (!itemsState) return undefined;
  return kanbanItemsSelectors.selectById({ kanban: { items: itemsState } } as RootState, itemId);
};

// Selector para items por funnel
export const selectKanbanItemsByFunnel = createSelector(
  [selectAllKanbanItems, (_state: RootState, funnelId: number) => funnelId],
  (items, funnelId) => items.filter(item => item.funnel_id === funnelId),
);

// Selector por stage ID (alternativa ao stageKey)
export const selectKanbanItemsByStageId = createSelector(
  [selectKanbanStages, (_state: RootState, stageId: number) => stageId],
  (stages, stageId) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.items || [];
  },
);

// Selector para agentes da conta
export const selectAccountAgents = createSelector(
  [selectKanbanState],
  kanban => kanban?.accountAgents || [],
);

// Selector para encontrar item do Kanban por conversation_id (singular - primeiro encontrado)
export const selectKanbanItemByConversationId = createSelector(
  [selectAllKanbanItems, (_state: RootState, conversationId: number) => conversationId],
  (items, conversationId) => {
    return items.find(item => item.conversation_id === conversationId);
  },
);

// Selector para encontrar TODOS os items do Kanban por conversation_id
export const selectKanbanItemsListByConversationId = createSelector(
  [selectAllKanbanItems, (_state: RootState, conversationId: number) => conversationId],
  (items, conversationId) => {
    return items.filter(item => item.conversation_id === conversationId);
  },
);
