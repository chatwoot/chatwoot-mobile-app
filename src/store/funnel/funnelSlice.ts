import { createSlice } from '@reduxjs/toolkit';
import { funnelActions } from './funnelActions';
import type { FunnelCard, FunnelStage } from './funnelTypes';

export interface FunnelState {
  stages: FunnelStage[];
  // Карточки/итоги/страница — по этапам. Ключ — String(stage.id) либо 'unassigned'
  // (колонка «Непринятые»).
  cards: Record<string, FunnelCard[]>;
  total: Record<string, number>;
  page: Record<string, number>;
  isLoadingStages: boolean;
  isLoadingColumn: boolean;
  isUpdating: boolean;
}

const initialState: FunnelState = {
  stages: [],
  cards: {},
  total: {},
  page: {},
  isLoadingStages: false,
  isLoadingColumn: false,
  isUpdating: false,
};

// Ключ колонки для карточки: null/undefined stage_id → 'unassigned', иначе строковое
// представление id этапа (сервер может прислать stage_id и числом, и строкой —
// диалог хранит его в jsonb).
const stageKeyFor = (stageId: FunnelCard['stage_id']): string =>
  stageId === null || stageId === undefined ? 'unassigned' : String(stageId);

const funnelSlice = createSlice({
  name: 'funnel',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(funnelActions.fetchStages.pending, state => {
        state.isLoadingStages = true;
      })
      .addCase(funnelActions.fetchStages.fulfilled, (state, action) => {
        state.isLoadingStages = false;
        state.stages = [...action.payload].sort((a, b) => a.position - b.position);
      })
      .addCase(funnelActions.fetchStages.rejected, state => {
        state.isLoadingStages = false;
      })

      .addCase(funnelActions.fetchStageColumn.pending, state => {
        state.isLoadingColumn = true;
      })
      .addCase(funnelActions.fetchStageColumn.fulfilled, (state, action) => {
        state.isLoadingColumn = false;
        const { stageId, page, total, cards } = action.payload;
        const key = String(stageId);
        state.total[key] = total;
        state.page[key] = page;

        if (page > 1) {
          // Догрузка складывает карточки без дублей по id; page 1 заменяет колонку целиком.
          const existing = state.cards[key] || [];
          const merged = [...existing];
          cards.forEach(newCard => {
            const index = merged.findIndex(c => c.id === newCard.id);
            if (index === -1) {
              merged.push(newCard);
            } else {
              merged[index] = newCard;
            }
          });
          state.cards[key] = merged;
        } else {
          state.cards[key] = cards;
        }
      })
      .addCase(funnelActions.fetchStageColumn.rejected, state => {
        state.isLoadingColumn = false;
      })

      .addCase(funnelActions.updateConversationFunnel.pending, state => {
        state.isUpdating = true;
      })
      .addCase(funnelActions.updateConversationFunnel.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedCard = action.payload;
        const newStageKey = stageKeyFor(updatedCard.stage_id);

        // Карточка могла лежать в любой из уже загруженных колонок — ищем везде.
        Object.keys(state.cards).forEach(stageKey => {
          const list = state.cards[stageKey];
          const index = list.findIndex(c => c.id === updatedCard.id);
          if (index === -1) return;

          if (stageKey === newStageKey) {
            // Этап не менялся (или карточка уже лежит в колонке, совпадающей с новым
            // этапом) — просто обновляем данные на месте.
            list[index] = updatedCard;
          } else {
            // Этап сменился — карточка выбывает из старой колонки. В новую колонку
            // её вручную НЕ дописываем (грабля из плана: место подгрузится при
            // открытии этой колонки, дописывание вручную рискует внести дубль/грязную
            // страницу).
            list.splice(index, 1);
            if (state.total[stageKey] !== undefined) {
              state.total[stageKey] = Math.max(0, state.total[stageKey] - 1);
            }
          }
        });
      })
      .addCase(funnelActions.updateConversationFunnel.rejected, state => {
        state.isUpdating = false;
      });
  },
});

export default funnelSlice.reducer;
