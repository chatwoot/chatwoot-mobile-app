import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Agent } from '@/types/Agent';
import { KanbanService } from './kanbanService';
import { handleKanbanError } from './utils/errorHandler';
import type {
  AssignAgentPayload,
  BulkAssignAgentPayload,
  BulkMoveKanbanItemsPayload,
  BulkSetPriorityPayload,
  CreateChecklistItemPayload,
  CreateFunnelPayload,
  CreateKanbanItemPayload,
  CreateNotePayload,
  KanbanAssignedAgent,
  KanbanFunnel,
  KanbanItem,
  MoveKanbanItemPayload,
  ReorderKanbanItemsPayload,
  UpdateFunnelPayload,
  UpdateKanbanItemPayload,
} from './kanbanTypes';

export const kanbanActions = {
  getFunnels: createAsyncThunk<KanbanFunnel[], void>(
    'kanban/getFunnels',
    async (_, { rejectWithValue }) => {
      try {
        const result = await KanbanService.getFunnels();
        return result;
      } catch (error: any) {
        if (error.response?.status === 401) {
          const errorData = error.response?.data;

          // Mensagem amigável para erro de autenticação
          const friendlyMessage =
            errorData?.error === 'Invalid access token' ||
            errorData?.message?.includes('token') ||
            errorData?.message?.includes('access token')
              ? 'Por favor, conecte um token para poder espelhar os seus dados no app'
              : 'Erro de autenticação. Verifique seu token de acesso.';

          return rejectWithValue(friendlyMessage);
        }

        // Tratamento para outros erros 4xx
        if (error.response?.status >= 400 && error.response?.status < 500) {
          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            'Erro ao carregar dados do Kanban. Verifique sua conexão e token.';

          return rejectWithValue(errorMessage);
        }

        return rejectWithValue(
          error.response?.data?.message || 'Erro ao buscar funnels. Tente novamente mais tarde.',
        );
      }
    },
  ),

  getFunnel: createAsyncThunk<KanbanFunnel, number>(
    'kanban/getFunnel',
    async (funnelId, { rejectWithValue }) => {
      try {
        return await KanbanService.getFunnel(funnelId);
      } catch (error: any) {
        // Tratamento específico para erro 401
        if (error.response?.status === 401) {
          return rejectWithValue(
            'Por favor, conecte um token para poder espelhar os seus dados no app',
          );
        }

        return rejectWithValue(
          error.response?.data?.message || 'Erro ao buscar funnel. Tente novamente mais tarde.',
        );
      }
    },
  ),

  createFunnel: createAsyncThunk<KanbanFunnel, CreateFunnelPayload>(
    'kanban/createFunnel',
    async (payload, { rejectWithValue }) => {
      try {
        return await KanbanService.createFunnel(payload);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao criar funnel');
      }
    },
  ),

  updateFunnel: createAsyncThunk<KanbanFunnel, { funnelId: number; payload: UpdateFunnelPayload }>(
    'kanban/updateFunnel',
    async ({ funnelId, payload }, { rejectWithValue }) => {
      try {
        return await KanbanService.updateFunnel(funnelId, payload);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar funnel');
      }
    },
  ),

  deleteFunnel: createAsyncThunk<number, number>(
    'kanban/deleteFunnel',
    async (funnelId, { rejectWithValue }) => {
      try {
        await KanbanService.deleteFunnel(funnelId);
        return funnelId;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao deletar funnel');
      }
    },
  ),

  getKanbanItems: createAsyncThunk<KanbanItem[], void>(
    'kanban/getKanbanItems',
    async (_, { rejectWithValue }) => {
      try {
        return await KanbanService.getKanbanItems();
      } catch (error: any) {
        // Tratamento específico para erro 401
        if (error.response?.status === 401) {
          return rejectWithValue(
            'Por favor, conecte um token para poder espelhar os seus dados no app',
          );
        }

        return rejectWithValue(
          error.response?.data?.message || 'Erro ao buscar items. Tente novamente mais tarde.',
        );
      }
    },
  ),

  getKanbanItem: createAsyncThunk<KanbanItem, number>(
    'kanban/getKanbanItem',
    async (itemId, { rejectWithValue }) => {
      try {
        return await KanbanService.getKanbanItem(itemId);
      } catch (error: any) {
        // Tratamento específico para erro 401
        if (error.response?.status === 401) {
          return rejectWithValue(
            'Por favor, conecte um token para poder espelhar os seus dados no app',
          );
        }

        return rejectWithValue(
          error.response?.data?.message || 'Erro ao buscar item. Tente novamente mais tarde.',
        );
      }
    },
  ),

  createKanbanItem: createAsyncThunk<KanbanItem, CreateKanbanItemPayload>(
    'kanban/createKanbanItem',
    async (payload, { rejectWithValue }) => {
      try {
        return await KanbanService.createKanbanItem(payload);
      } catch (error: any) {
        // Tratamento específico para erro 401
        if (error.response?.status === 401) {
          return rejectWithValue(
            'Por favor, conecte um token para poder espelhar os seus dados no app',
          );
        }

        return rejectWithValue(
          error.response?.data?.message || 'Erro ao criar item. Tente novamente mais tarde.',
        );
      }
    },
  ),

  updateKanbanItem: createAsyncThunk<
    KanbanItem,
    { itemId: number; payload: UpdateKanbanItemPayload }
  >('kanban/updateKanbanItem', async ({ itemId, payload }, { rejectWithValue }) => {
    try {
      return await KanbanService.updateKanbanItem(itemId, payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar item');
    }
  }),

  deleteKanbanItem: createAsyncThunk<number, number>(
    'kanban/deleteKanbanItem',
    async (itemId, { rejectWithValue }) => {
      try {
        await KanbanService.deleteKanbanItem(itemId);
        return itemId;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao deletar item');
      }
    },
  ),

  moveKanbanItem: createAsyncThunk<KanbanItem, MoveKanbanItemPayload>(
    'kanban/moveKanbanItem',
    async (payload, { rejectWithValue }) => {
      try {
        return await KanbanService.moveKanbanItem(payload);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao mover item');
      }
    },
  ),

  moveKanbanItemToStage: createAsyncThunk<
    KanbanItem,
    { itemId: number; funnelStage: string; funnelId: number }
  >(
    'kanban/moveKanbanItemToStage',
    async ({ itemId, funnelStage, funnelId }, { rejectWithValue }) => {
      try {
        return await KanbanService.moveKanbanItemToStage(itemId, funnelStage, funnelId);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao mover item para stage');
      }
    },
  ),

  reorderKanbanItems: createAsyncThunk<void, ReorderKanbanItemsPayload>(
    'kanban/reorderKanbanItems',
    async (payload, { rejectWithValue }) => {
      try {
        await KanbanService.reorderKanbanItems(payload);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao reordenar items');
      }
    },
  ),

  bulkMoveKanbanItems: createAsyncThunk<void, BulkMoveKanbanItemsPayload>(
    'kanban/bulkMoveKanbanItems',
    async (payload, { rejectWithValue }) => {
      try {
        await KanbanService.bulkMoveKanbanItems(payload);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao mover items em lote');
      }
    },
  ),

  bulkSetPriority: createAsyncThunk<void, BulkSetPriorityPayload>(
    'kanban/bulkSetPriority',
    async (payload, { rejectWithValue }) => {
      try {
        await KanbanService.bulkSetPriority(payload);
      } catch (error: any) {
        return rejectWithValue(
          error.response?.data?.message || 'Erro ao definir prioridade em lote',
        );
      }
    },
  ),

  assignAgent: createAsyncThunk<void, { itemId: number; payload: AssignAgentPayload }>(
    'kanban/assignAgent',
    async ({ itemId, payload }, { rejectWithValue }) => {
      try {
        await KanbanService.assignAgent(itemId, payload);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atribuir agente');
      }
    },
  ),

  removeAgent: createAsyncThunk<void, { itemId: number; agentId?: number }>(
    'kanban/removeAgent',
    async ({ itemId, agentId }, { rejectWithValue }) => {
      try {
        await KanbanService.removeAgent(itemId, agentId ? { agent_id: agentId } : undefined);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao remover agente');
      }
    },
  ),

  bulkAssignAgent: createAsyncThunk<void, BulkAssignAgentPayload>(
    'kanban/bulkAssignAgent',
    async (payload, { rejectWithValue }) => {
      try {
        await KanbanService.bulkAssignAgent(payload);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atribuir agente em lote');
      }
    },
  ),

  createChecklistItem: createAsyncThunk<
    unknown,
    { itemId: number; payload: CreateChecklistItemPayload }
  >('kanban/createChecklistItem', async ({ itemId, payload }, { rejectWithValue }) => {
    try {
      return await KanbanService.createChecklistItem(itemId, payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar item de checklist');
    }
  }),

  createNote: createAsyncThunk<unknown, { itemId: number; payload: CreateNotePayload }>(
    'kanban/createNote',
    async ({ itemId, payload }, { rejectWithValue }) => {
      try {
        return await KanbanService.createNote(itemId, payload);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao criar nota');
      }
    },
  ),

  getAccountAgents: createAsyncThunk<Agent[], void>(
    'kanban/getAccountAgents',
    async (_, { rejectWithValue }) => {
      try {
        return await KanbanService.getAccountAgents();
      } catch (error: any) {
        return rejectWithValue(
          error.response?.data?.message || 'Erro ao buscar agentes da conta',
        );
      }
    },
  ),
};
