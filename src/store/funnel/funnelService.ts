import { apiService } from '@/services/APIService';
import type {
  FunnelStage,
  FunnelStagesAPIResponse,
  FunnelStageColumnAPIResponse,
  FunnelUpdateConversationAPIResponse,
  FetchStageColumnPayload,
  FetchStageColumnResult,
  UpdateConversationFunnelPayload,
  FunnelCard,
} from './funnelTypes';

export class FunnelService {
  static async fetchStages(): Promise<FunnelStage[]> {
    const response = await apiService.get<FunnelStagesAPIResponse>('conomni/funnel/stages');
    return response.data.payload;
  }

  static async fetchStageColumn({
    stageId,
    page,
  }: FetchStageColumnPayload): Promise<FetchStageColumnResult> {
    // stageId — сегмент ПУТИ (в т.ч. специальное значение 'unassigned'), не query-параметр.
    const response = await apiService.get<FunnelStageColumnAPIResponse>(
      `conomni/funnel/board/${stageId}`,
      { params: { page } },
    );
    const { total, cards } = response.data.payload;
    return { stageId, page, total, cards };
  }

  static async updateConversationFunnel(
    payload: UpdateConversationFunnelPayload,
  ): Promise<FunnelCard> {
    const { conversationId, stageId, price } = payload;

    // В тело попадают ТОЛЬКО реально переданные ключи. `!== undefined` отличает
    // «не передано» (пропустить) от «передано null» (стереть этап) — при омиссии
    // stageId в объекте его вообще не будет как свойства, значит здесь undefined.
    const body: { stage_id?: number | string | null; price?: number | string } = {};
    if (stageId !== undefined) {
      body.stage_id = stageId;
    }
    if (price !== undefined) {
      body.price = price;
    }

    // Роут форка принимает строго PATCH (`patch 'funnel/conversations/:id'`),
    // PUT-алиаса нет — метод `patch` добавлен в APIService этой же волной.
    const response = await apiService.patch<FunnelUpdateConversationAPIResponse, typeof body>(
      `conomni/funnel/conversations/${conversationId}`,
      body,
    );
    return response.data.payload;
  }
}
