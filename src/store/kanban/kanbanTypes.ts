export interface KanbanFunnel {
  id: number;
  name: string;
  description?: string;
  account_id: number;
  active?: boolean;
  created_at: string;
  updated_at: string;
  stages?: KanbanStage[] | Record<string, Omit<KanbanStage, 'id' | 'funnel_id' | 'items'>>;
  settings?: {
    agents?: {
      id: number;
      name: string;
      email: string;
      role: string;
      availability_status?: string;
    }[];
  };
  global_custom_attributes?: unknown[];
}

export interface KanbanStage {
  id: number;
  funnel_id: number;
  name: string;
  position: number;
  color?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  items?: KanbanItem[];
  stage_key?: string;
}

export interface KanbanItem {
  id: number;
  funnel_id: number;
  stage_id?: number;
  stage_key?: string;
  funnel_stage?: string;
  conversation_id?: number;
  conversation_display_id?: number;
  title: string;
  description?: string;
  position?: number;
  priority?: string;
  due_date?: string;
  stage_entered_at?: string;
  created_at: string;
  updated_at: string;
  assigned_agents?: KanbanAssignedAgent[];
  checklist?: {
    total_count: number;
    completed_count: number;
  };
  notes?: KanbanNote[];
  item_details?: {
    title: string;
    description?: string;
    priority?: string;
    currency?: {
      code: string;
      locale: string;
      symbol: string;
    };
    conversation_id?: number;
    scheduling_type?: string;
    notes?: unknown[];
  };
  conversation?: {
    id: number;
    display_id: number;
    inbox_id: number;
    status: string;
    assignee?: {
      id: number;
      name: string;
      email: string;
      avatar_url?: string;
    };
    contact?: {
      id: number;
      name: string;
      email?: string;
      phone_number?: string;
      thumbnail?: string;
    };
  };
}

export interface KanbanAssignedAgent {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface KanbanChecklistItem {
  id: number;
  kanban_item_id: number;
  title: string;
  completed: boolean;
  position: number;
  assigned_agent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface KanbanNote {
  id: number;
  kanban_item_id: number;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFunnelPayload {
  name: string;
  description?: string;
  active?: boolean;
  stages?: Record<
    string,
    {
      name: string;
      color: string;
      position: number;
      description?: string;
      auto_create_conditions?: {
        type: string;
        value: string;
      }[];
    }
  >;
  settings?: {
    agents?: number[];
  };
  global_custom_attributes?: unknown[];
}

export interface UpdateFunnelPayload {
  name?: string;
  description?: string;
  stages?: Array<{
    id?: number;
    name: string;
    position: number;
    color?: string;
    auto_assign?: boolean;
    description?: string;
  }>;
  settings?: {
    auto_assign?: boolean;
    default_stage_id?: number;
    notifications_enabled?: boolean;
    agents?: number[];
  };
}

export interface CreateKanbanItemPayload {
  kanban_item: {
    funnel_id: string;
    funnel_stage: string;
    position: number;
    assigned_agents?: number[];
    conversation_display_id?: number;
    item_details: {
      title: string;
      description?: string;
      priority?: string;
      currency?: {
        symbol: string;
        code: string;
        locale: string;
      };
      custom_attributes?: Record<string, unknown>;
      offers?: unknown[];
      deadline_at?: string | null;
      scheduling_type?: 'deadline' | 'schedule';
      scheduled_at?: string | null;
      conversation_id?: number;
    };
  };
}

export interface UpdateKanbanItemPayload {
  item_details?: {
    title?: string;
    description?: string;
    conversation_id?: number;
  };
  priority?: string;
  status?: string;
  stage_id?: number;
  due_date?: string;
  tags?: string[];
  custom_attributes?: Record<string, unknown>;
  conversation_id?: number;
  // Manter campos antigos para compatibilidade
  title?: string;
  description?: string;
  position?: number;
}

export interface MoveKanbanItemPayload {
  item_id: number;
  stage_id: number;
  position: number;
}

export interface ReorderKanbanItemsPayload {
  items: {
    id: number;
    position: number;
  }[];
}

export interface BulkMoveKanbanItemsPayload {
  item_ids: number[];
  stage_id: number;
}

export interface BulkSetPriorityPayload {
  item_ids: number[];
  priority: string;
}

export interface AssignAgentPayload {
  agent_id: number;
}

export interface RemoveAgentPayload {
  agent_id: number;
}

export interface BulkAssignAgentPayload {
  item_ids: number[];
  agent_id: number;
}

export interface CreateChecklistItemPayload {
  title: string;
  position?: number;
}

export interface CreateNotePayload {
  content: string;
}

export interface ChangeStatusPayload {
  status: string;
}

export interface StageStats {
  stage_id: string;
  item_count: number;
}

export interface KanbanState {
  funnels: KanbanFunnel[];
  currentFunnel: KanbanFunnel | null;
  isLoading: boolean;
  error: string | null;
}
