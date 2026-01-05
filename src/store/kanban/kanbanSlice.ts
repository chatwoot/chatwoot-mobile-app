import type { RootState } from '@/store';
import type { Agent } from '@/types/Agent';
import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { kanbanActions } from './kanbanActions';
import type { KanbanFunnel, KanbanItem } from './kanbanTypes';

// Entity adapter para items (otimização de performance)
const kanbanItemsAdapter = createEntityAdapter<KanbanItem>({
  selectId: item => item.id,
  sortComparer: (a, b) => (a.position || 0) - (b.position || 0),
});

export interface KanbanState {
  funnels: KanbanFunnel[];
  currentFunnel: KanbanFunnel | null;
  items: ReturnType<typeof kanbanItemsAdapter.getInitialState>;
  currentItem: KanbanItem | null;
  accountAgents: Agent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: KanbanState = {
  funnels: [],
  currentFunnel: null,
  items: kanbanItemsAdapter.getInitialState(),
  currentItem: null,
  accountAgents: [],
  isLoading: false,
  error: null,
};

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    setCurrentFunnel: (state, action: PayloadAction<KanbanFunnel | null>) => {
      state.currentFunnel = action.payload;
    },
    setCurrentItem: (state, action: PayloadAction<KanbanItem | null>) => {
      state.currentItem = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    clearKanban: state => {
      state.funnels = [];
      state.currentFunnel = null;
      state.currentItem = null;
      kanbanItemsAdapter.removeAll(state.items);
      state.error = null;
    },
    // Optimistic update helper
    updateItemInFunnel: (state, action: PayloadAction<KanbanItem>) => {
      if (!state.currentFunnel?.stages) return;

      const item = action.payload;
      const stages = Array.isArray(state.currentFunnel.stages) ? state.currentFunnel.stages : [];

      stages.forEach(stage => {
        if (Array.isArray(stage.items)) {
          const index = stage.items.findIndex(i => i.id === item.id);
          if (index >= 0) {
            stage.items[index] = item;
          }
        }
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(kanbanActions.getFunnels.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(kanbanActions.getFunnels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.funnels = action.payload;
      })
      .addCase(kanbanActions.getFunnels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.getFunnel.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(kanbanActions.getFunnel.fulfilled, (state, action) => {
        state.isLoading = false;
        const funnel = action.payload;
        state.currentFunnel = funnel;
        const index = state.funnels.findIndex(f => f.id === funnel.id);
        if (index >= 0) {
          state.funnels[index] = funnel;
        } else {
          state.funnels.push(funnel);
        }
      })
      .addCase(kanbanActions.getFunnel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.createFunnel.fulfilled, (state, action) => {
        state.funnels.push(action.payload);
      })
      .addCase(kanbanActions.createFunnel.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.updateFunnel.fulfilled, (state, action) => {
        const funnel = action.payload;
        const index = state.funnels.findIndex(f => f.id === funnel.id);
        if (index >= 0) {
          state.funnels[index] = funnel;
        }
        if (state.currentFunnel?.id === funnel.id) {
          state.currentFunnel = funnel;
        }
      })
      .addCase(kanbanActions.updateFunnel.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.deleteFunnel.fulfilled, (state, action) => {
        state.funnels = state.funnels.filter(f => f.id !== action.payload);
        if (state.currentFunnel?.id === action.payload) {
          state.currentFunnel = null;
        }
      })
      .addCase(kanbanActions.deleteFunnel.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Items reducers
      .addCase(kanbanActions.getKanbanItems.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(kanbanActions.getKanbanItems.fulfilled, (state, action) => {
        state.isLoading = false;
        kanbanItemsAdapter.setAll(state.items, action.payload);
      })
      .addCase(kanbanActions.getKanbanItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.getKanbanItem.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(kanbanActions.getKanbanItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const item = action.payload;
        state.currentItem = item;

        // Garantir que items está inicializado antes de usar o adapter
        if (!state.items) {
          state.items = kanbanItemsAdapter.getInitialState();
        }

        kanbanItemsAdapter.upsertOne(state.items, item);

        // Atualizar item no funnel se necessário
        if (state.currentFunnel?.stages) {
          const stages = Array.isArray(state.currentFunnel.stages)
            ? state.currentFunnel.stages
            : [];

          stages.forEach(stage => {
            if (Array.isArray(stage.items)) {
              const index = stage.items.findIndex(i => i.id === item.id);
              if (index >= 0) {
                stage.items[index] = item;
              }
            }
          });
        }
      })
      .addCase(kanbanActions.getKanbanItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.createKanbanItem.fulfilled, (state, action) => {
        const item = action.payload;

        // Garantir que items está inicializado
        if (!state.items) {
          state.items = kanbanItemsAdapter.getInitialState();
        }

        kanbanItemsAdapter.addOne(state.items, item);

        // Adicionar ao stage correspondente no funnel atual
        if (state.currentFunnel?.stages) {
          const stages = Array.isArray(state.currentFunnel.stages)
            ? state.currentFunnel.stages
            : [];

          const stage = stages.find(s => s.stage_key === item.stage_key || s.id === item.stage_id);

          if (stage && Array.isArray(stage.items)) {
            stage.items.push(item);
          }
        }
      })
      .addCase(kanbanActions.createKanbanItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.updateKanbanItem.fulfilled, (state, action) => {
        const item = action.payload;

        // Garantir que items está inicializado
        if (!state.items) {
          state.items = kanbanItemsAdapter.getInitialState();
        }

        kanbanItemsAdapter.upsertOne(state.items, item);

        if (state.currentItem?.id === item.id) {
          state.currentItem = item;
        }

        // Usar reducer helper para atualizar no funnel
        kanbanSlice.caseReducers.updateItemInFunnel(state, {
          type: 'kanban/updateItemInFunnel',
          payload: item,
        });
      })
      .addCase(kanbanActions.updateKanbanItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.deleteKanbanItem.fulfilled, (state, action) => {
        const itemId = action.payload;

        // Garantir que items está inicializado
        if (!state.items) {
          state.items = kanbanItemsAdapter.getInitialState();
        }

        kanbanItemsAdapter.removeOne(state.items, itemId);

        if (state.currentItem?.id === itemId) {
          state.currentItem = null;
        }

        // Remover do stage correspondente
        if (state.currentFunnel?.stages) {
          const stages = Array.isArray(state.currentFunnel.stages)
            ? state.currentFunnel.stages
            : [];

          stages.forEach(stage => {
            if (Array.isArray(stage.items)) {
              stage.items = stage.items.filter(i => i.id !== itemId);
            }
          });
        }
      })
      .addCase(kanbanActions.deleteKanbanItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.moveKanbanItemToStage.fulfilled, (state, action) => {
        const item = action.payload;

        // Garantir que items está inicializado
        if (!state.items) {
          state.items = kanbanItemsAdapter.getInitialState();
        }

        kanbanItemsAdapter.upsertOne(state.items, item);

        // Remover do stage antigo e adicionar ao novo
        if (state.currentFunnel?.stages) {
          const stages = Array.isArray(state.currentFunnel.stages)
            ? state.currentFunnel.stages
            : [];

          stages.forEach(stage => {
            if (Array.isArray(stage.items)) {
              stage.items = stage.items.filter(i => i.id !== item.id);
            }
          });

          const targetStage = stages.find(
            s => s.stage_key === item.stage_key || s.id === item.stage_id,
          );

          if (targetStage && Array.isArray(targetStage.items)) {
            targetStage.items.push(item);
          }
        }
      })
      .addCase(kanbanActions.moveKanbanItemToStage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(kanbanActions.getAccountAgents.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(kanbanActions.getAccountAgents.fulfilled, (state, action) => {
        state.accountAgents = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(kanbanActions.getAccountAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentFunnel, setCurrentItem, clearError, clearKanban, updateItemInFunnel } =
  kanbanSlice.actions;

// Export adapter selectors - these are used in selectors file
export const kanbanItemsSelectors = kanbanItemsAdapter.getSelectors(
  (state: RootState) => state.kanban.items,
);

export default kanbanSlice.reducer;
