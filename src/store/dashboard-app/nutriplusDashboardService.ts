import { apiService } from '@/services/APIService';

type NutriplusBootstrapResponse = {
  token: string;
  expires_in: number;
};

export class NutriplusDashboardService {
  static async bootstrap(conversationId: number): Promise<NutriplusBootstrapResponse> {
    const response = await apiService.post<NutriplusBootstrapResponse>('nutriplus/bootstrap', {
      conversation_id: conversationId,
    });

    return response.data;
  }
}
