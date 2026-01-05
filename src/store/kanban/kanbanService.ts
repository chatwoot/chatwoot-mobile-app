import { apiService } from '@/services/APIService';
import { getStore } from '@/store/storeAccessor';
import { logger } from '@/utils/logger';
import type { Agent } from '@/types/Agent';
import type {
  AssignAgentPayload,
  BulkAssignAgentPayload,
  BulkMoveKanbanItemsPayload,
  BulkSetPriorityPayload,
  CreateChecklistItemPayload,
  CreateFunnelPayload,
  CreateKanbanItemPayload,
  CreateNotePayload,
  KanbanFunnel,
  KanbanItem,
  MoveKanbanItemPayload,
  ReorderKanbanItemsPayload,
  UpdateFunnelPayload,
  UpdateKanbanItemPayload,
} from './kanbanTypes';

interface ApiKanbanItem {
  id?: number;
  funnel_id?: number;
  stage_id?: number;
  funnel_stage?: string;
  conversation_id?: number;
  conversation_display_id?: number;
  title?: string;
  description?: string;
  position?: number;
  priority?: string;
  due_date?: string;
  stage_entered_at?: string;
  created_at?: string;
  updated_at?: string;
  assigned_agents?: unknown[];
  checklist?: unknown;
  notes?: unknown[];
  item_details?: {
    title?: string;
    description?: string;
    conversation_id?: number;
    priority?: string;
    notes?: unknown[];
  };
  conversation?: unknown;
}

function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export class KanbanService {
  static async getFunnels(): Promise<KanbanFunnel[]> {
    try {
      const response = await apiService.get<
        { payload?: KanbanFunnel[]; data?: KanbanFunnel[] } | KanbanFunnel[]
      >('kanban/funnels');

      if (Array.isArray(response.data)) {
        return response.data;
      }

      if (response.data?.payload) {
        return response.data.payload;
      }

      if (response.data?.data) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      logger.error('[KanbanService] Error getting funnels:', error);

      // Se for erro 401, o token pode estar inválido
      if (error.response?.status === 401) {
        throw new Error('Token de acesso inválido. Por favor, faça login novamente.');
      }

      throw error;
    }
  }

  static async getFunnel(funnelId: number): Promise<KanbanFunnel> {
    try {
      const response = await apiService.get<
        { payload?: KanbanFunnel; data?: KanbanFunnel } | KanbanFunnel
      >(`kanban/funnels/${funnelId}`);

      let funnel: KanbanFunnel;

      if (
        Array.isArray(response.data) ||
        (response.data && !('payload' in response.data) && !('data' in response.data))
      ) {
        funnel = response.data as KanbanFunnel;
      } else {
        funnel = response.data?.payload || response.data?.data || (response.data as KanbanFunnel);
      }

      if (funnel.stages && typeof funnel.stages === 'object' && !Array.isArray(funnel.stages)) {
        const stagesObject = funnel.stages as Record<string, any>;
        const stageKeys = Object.keys(stagesObject);

        funnel.stages = await Promise.all(
          Object.entries(stagesObject).map(async ([key, stageData], index) => {
            const stageId = stageData.id || hashStringToNumber(key) || index + 1;

            let stageItems: KanbanItem[] = [];
            if (stageData.items) {
              if (Array.isArray(stageData.items)) {
                stageItems = stageData.items.map(this.mapApiItemToKanbanItem);
              } else if (typeof stageData.items === 'object' && stageData.items !== null) {
                stageItems = Object.values(stageData.items).map(this.mapApiItemToKanbanItem);
              }
            } else {
              try {
                const items = await this.getKanbanItems(funnel.id, key);
                stageItems = items;
              } catch (error) {
                if (__DEV__) {
                  logger.warn(`[KanbanService] Failed to load items for stage ${key}:`, error);
                }
              }
            }

            return {
              id: stageId,
              funnel_id: funnel.id,
              name: stageData.name || key,
              position: stageData.position || 0,
              color: stageData.color,
              description: stageData.description,
              created_at: stageData.created_at || new Date().toISOString(),
              updated_at: stageData.updated_at || new Date().toISOString(),
              items: stageItems.sort((a, b) => (a.position || 0) - (b.position || 0)),
              stage_key: key,
            };
          }),
        );
      } else if (!funnel.stages || !Array.isArray(funnel.stages)) {
        funnel.stages = [];
      }

      return funnel;
    } catch (error: any) {
      logger.error('[KanbanService] Error getting funnel:', error);

      // Se for erro 401, o token pode estar inválido
      if (error.response?.status === 401) {
        throw new Error('Token de acesso inválido. Por favor, faça login novamente.');
      }

      throw error;
    }
  }

  static async createFunnel(payload: CreateFunnelPayload): Promise<KanbanFunnel> {
    const response = await apiService.post<
      { payload?: KanbanFunnel; data?: KanbanFunnel } | KanbanFunnel
    >('kanban/funnels', payload);

    if (response.data && !('payload' in response.data) && !('data' in response.data)) {
      return response.data as KanbanFunnel;
    }

    return response.data?.payload || response.data?.data || (response.data as KanbanFunnel);
  }

  static async updateFunnel(funnelId: number, payload: UpdateFunnelPayload): Promise<KanbanFunnel> {
    const response = await apiService.put<
      { payload?: KanbanFunnel; data?: KanbanFunnel } | KanbanFunnel
    >(`kanban/funnels/${funnelId}`, payload);

    if (response.data && !('payload' in response.data) && !('data' in response.data)) {
      return response.data as KanbanFunnel;
    }

    return response.data?.payload || response.data?.data || (response.data as KanbanFunnel);
  }

  static async deleteFunnel(funnelId: number): Promise<void> {
    await apiService.delete(`kanban/funnels/${funnelId}`);
  }

  static async getFunnelStageStats(funnelId: number): Promise<unknown> {
    const response = await apiService.get(`kanban/funnels/${funnelId}/stage_stats`);
    return response.data;
  }

  static async getKanbanItems(funnelId?: number, stageKey?: string): Promise<KanbanItem[]> {
    const store = getStore();
    const state = store.getState();
    const accountId = state.auth.user?.account_id;
    const installationUrl = state.settings?.installationUrl;

    if (!accountId || !installationUrl) {
      logger.error('[KanbanService] Missing accountId or installationUrl for getKanbanItems');
      return [];
    }

    let url = `api/v1/accounts/${accountId}/kanban_items`;
    const params: string[] = [];

    if (funnelId) {
      params.push(`funnel_id=${funnelId}`);
    }
    if (stageKey) {
      params.push(`stage_id=${encodeURIComponent(stageKey)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    try {
      const axios = require('axios').default;
      const headers = state.auth.headers || {};

      const response = await axios.get(`${installationUrl}${url}`, {
        headers: {
          'access-token': headers['access-token'],
          uid: headers.uid,
          client: headers.client,
        },
      });

      let items: KanbanItem[] = [];

      if (Array.isArray(response.data)) {
        items = response.data
          .map(item => {
            try {
              return this.mapApiItemToKanbanItem(item);
            } catch (error) {
              logger.error('[KanbanService] Error mapping item:', error);
              return null;
            }
          })
          .filter((item): item is KanbanItem => item !== null);
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items
          .map(item => {
            try {
              return this.mapApiItemToKanbanItem(item);
            } catch (error) {
              logger.error('[KanbanService] Error mapping item:', error);
              return null;
            }
          })
          .filter((item): item is KanbanItem => item !== null);
      } else if (response.data?.payload && Array.isArray(response.data.payload)) {
        items = response.data.payload
          .map(item => {
            try {
              return this.mapApiItemToKanbanItem(item);
            } catch (error) {
              logger.error('[KanbanService] Error mapping item:', error);
              return null;
            }
          })
          .filter((item): item is KanbanItem => item !== null);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        items = response.data.data
          .map(item => {
            try {
              return this.mapApiItemToKanbanItem(item);
            } catch (error) {
              logger.error('[KanbanService] Error mapping item:', error);
              return null;
            }
          })
          .filter((item): item is KanbanItem => item !== null);
      }

      return items;
    } catch (error: any) {
      logger.error('[KanbanService] Error fetching kanban items:', error);
      if (__DEV__) {
        logger.log('[KanbanService] Error response:', error.response?.data);
      }
      return [];
    }
  }

  private static mapApiItemToKanbanItem(apiItem: ApiKanbanItem): KanbanItem {
    if (!apiItem) {
      logger.error('[KanbanService] Invalid apiItem: null or undefined');
      throw new Error('Invalid kanban item: apiItem is null or undefined');
    }

    if (!apiItem.id || typeof apiItem.id !== 'number') {
      logger.error('[KanbanService] Invalid kanban item: missing or invalid id', apiItem);
      throw new Error('Invalid kanban item: missing or invalid id');
    }

    return {
      id: apiItem.id,
      funnel_id: apiItem.funnel_id,
      stage_id: apiItem.stage_id,
      stage_key: apiItem.funnel_stage,
      funnel_stage: apiItem.funnel_stage,
      conversation_id: apiItem.conversation_id || apiItem.item_details?.conversation_id,
      conversation_display_id: apiItem.conversation_display_id,
      title: apiItem.item_details?.title || apiItem.title || '',
      description: apiItem.item_details?.description || apiItem.description,
      position: typeof apiItem.position === 'number' ? apiItem.position : 0,
      priority: apiItem.item_details?.priority || apiItem.priority || 'none',
      due_date: apiItem.due_date,
      stage_entered_at: apiItem.stage_entered_at,
      created_at: apiItem.created_at,
      updated_at: apiItem.updated_at,
      assigned_agents: Array.isArray(apiItem.assigned_agents) ? apiItem.assigned_agents : [],
      checklist: apiItem.checklist,
      notes: Array.isArray(apiItem.item_details?.notes)
        ? apiItem.item_details.notes
        : Array.isArray(apiItem.notes)
          ? apiItem.notes
          : [],
      item_details: apiItem.item_details,
      conversation: apiItem.conversation,
    };
  }

  static async getKanbanItem(itemId: number): Promise<KanbanItem> {
    const response = await apiService.get<{ payload?: KanbanItem; data?: KanbanItem } | KanbanItem>(
      `kanban/kanban_items/${itemId}`,
    );

    if (response.data && !('payload' in response.data) && !('data' in response.data)) {
      return response.data as KanbanItem;
    }

    return response.data?.payload || response.data?.data || (response.data as KanbanItem);
  }

  static async createKanbanItem(payload: CreateKanbanItemPayload): Promise<KanbanItem> {
    const response = await apiService.post<
      { payload?: KanbanItem; data?: KanbanItem } | KanbanItem
    >('kanban/kanban_items', payload);

    if (response.data && !('payload' in response.data) && !('data' in response.data)) {
      return response.data as KanbanItem;
    }

    return response.data?.payload || response.data?.data || (response.data as KanbanItem);
  }

  static async updateKanbanItem(
    itemId: number,
    payload: UpdateKanbanItemPayload,
  ): Promise<KanbanItem> {
    const response = await apiService.put<{ payload?: KanbanItem; data?: KanbanItem } | KanbanItem>(
      `kanban/kanban_items/${itemId}`,
      payload,
    );

    if (response.data && !('payload' in response.data) && !('data' in response.data)) {
      return response.data as KanbanItem;
    }

    return response.data?.payload || response.data?.data || (response.data as KanbanItem);
  }

  static async deleteKanbanItem(itemId: number): Promise<void> {
    await apiService.delete(`kanban/kanban_items/${itemId}`);
  }

  static async moveKanbanItem(payload: MoveKanbanItemPayload): Promise<KanbanItem> {
    const response = await apiService.post<
      { payload?: KanbanItem; data?: KanbanItem } | KanbanItem
    >('kanban/kanban_items/move', payload);

    if (response.data && !('payload' in response.data) && !('data' in response.data)) {
      return response.data as KanbanItem;
    }

    return response.data?.payload || response.data?.data || (response.data as KanbanItem);
  }

  static async moveKanbanItemToStage(
    itemId: number,
    funnelStage: string,
    funnelId: number,
  ): Promise<KanbanItem> {
    const payload = {
      funnel_stage: funnelStage,
      stage_entered_at: new Date().toISOString(),
      funnel_id: funnelId.toString(),
    };

    const response = await apiService.post<
      { payload?: KanbanItem; data?: KanbanItem } | KanbanItem
    >(`kanban/kanban_items/${itemId}/move_to_stage`, payload);

    if (response.data && !('payload' in response.data) && !('data' in response.data)) {
      return response.data as KanbanItem;
    }

    return response.data?.payload || response.data?.data || (response.data as KanbanItem);
  }

  static async reorderKanbanItems(payload: ReorderKanbanItemsPayload): Promise<void> {
    await apiService.post('kanban/kanban_items/reorder', payload);
  }

  static async bulkMoveKanbanItems(payload: BulkMoveKanbanItemsPayload): Promise<void> {
    await apiService.post('kanban/kanban_items/bulk_move_items', payload);
  }

  static async bulkSetPriority(payload: BulkSetPriorityPayload): Promise<void> {
    await apiService.post('kanban/kanban_items/bulk_set_priority', payload);
  }

  static async assignAgent(itemId: number, payload: AssignAgentPayload): Promise<void> {
    await apiService.post(`kanban/kanban_items/${itemId}/assign_agent`, payload);
  }

  static async removeAgent(itemId: number, payload?: { agent_id: number }): Promise<void> {
    // Usar rota direta do Chatwoot (sem prefixo kanban/) para permitir DELETE
    // O endpoint correto é: api/v1/accounts/{id}/kanban_items/{idItem}/remove_agent
    // O APIService vai adicionar automaticamente api/v1/accounts/{accountId}/
    if (payload?.agent_id) {
      // Usar DELETE com agent_id no body
      await apiService.delete(`kanban_items/${itemId}/remove_agent`, {
        data: payload,
      });
    } else {
      // Remover todos os agentes (se a API suportar)
      await apiService.delete(`kanban_items/${itemId}/remove_agent`);
    }
  }

  static async getAssignedAgents(itemId: number): Promise<unknown> {
    const response = await apiService.get(`kanban/kanban_items/${itemId}/assigned_agents`);
    return response.data;
  }

  static async bulkAssignAgent(payload: BulkAssignAgentPayload): Promise<void> {
    await apiService.post('kanban/kanban_items/bulk_assign_agent', payload);
  }

  static async createChecklistItem(
    itemId: number,
    payload: CreateChecklistItemPayload,
  ): Promise<unknown> {
    const response = await apiService.post(
      `kanban/kanban_items/${itemId}/create_checklist_item`,
      payload,
    );
    return response.data;
  }

  static async duplicateChecklist(itemId: number): Promise<unknown> {
    const response = await apiService.post(`kanban/kanban_items/${itemId}/duplicate_checklist`);
    return response.data;
  }

  static async searchChecklist(itemId: number, query: string): Promise<unknown> {
    const response = await apiService.get(`kanban/kanban_items/${itemId}/search_checklist`, {
      params: { q: query },
    });
    return response.data;
  }

  static async assignAgentToChecklistItem(
    itemId: number,
    checklistItemId: number,
    agentId: number,
  ): Promise<void> {
    await apiService.post(`kanban/kanban_items/${itemId}/assign_agent_to_checklist_item`, {
      checklist_item_id: checklistItemId,
      agent_id: agentId,
    });
  }

  static async removeAgentFromChecklistItem(
    itemId: number,
    checklistItemId: number,
  ): Promise<void> {
    await apiService.post(`kanban/kanban_items/${itemId}/remove_agent_from_checklist_item`, {
      checklist_item_id: checklistItemId,
    });
  }

  static async createNote(itemId: number, payload: CreateNotePayload): Promise<unknown> {
    const response = await apiService.post(`kanban/kanban_items/${itemId}/create_note`, payload);
    return response.data;
  }

  static async getKanbanItemTimeReport(itemId: number): Promise<unknown> {
    const response = await apiService.get(`kanban/kanban_items/${itemId}/time_report`);
    return response.data;
  }

  static async getKanbanItemStageTimeBreakdown(itemId: number): Promise<unknown> {
    const response = await apiService.get(`kanban/kanban_items/${itemId}/stage_time_breakdown`);
    return response.data;
  }

  static async changeStatus(itemId: number, status: string): Promise<void> {
    await apiService.post(`kanban/kanban_items/${itemId}/change_status`, { status });
  }

  static async getAssignedAgents(itemId: number): Promise<KanbanAssignedAgent[]> {
    const response = await apiService.get<
      { payload?: KanbanAssignedAgent[]; data?: KanbanAssignedAgent[] } | KanbanAssignedAgent[]
    >(`kanban/kanban_items/${itemId}/assigned_agents`);

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data?.payload || response.data?.data || [];
  }

  static async getFunnelStageStats(funnelId: number): Promise<unknown> {
    const response = await apiService.get(`kanban/funnels/${funnelId}/stage_stats`);
    return response.data?.payload || response.data?.data || response.data;
  }

  static async getKanbanItemsDebug(): Promise<unknown> {
    const response = await apiService.get('kanban/kanban_items/debug');
    return response.data?.payload || response.data?.data || response.data;
  }

  static async getAccountAgents(): Promise<Agent[]> {
    try {
      const state = getStore().getState();
      const accountId = state.auth.user?.account_id;

      if (!accountId) {
        logger.error('[KanbanService] Missing accountId for getAccountAgents');
        return [];
      }

      const response = await apiService.get<{ payload?: Agent[]; data?: Agent[] } | Agent[]>(
        `agents`,
      );

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return response.data?.payload || response.data?.data || [];
    } catch (error: any) {
      logger.error('[KanbanService] Error getting account agents:', error);
      throw error;
    }
  }
}
