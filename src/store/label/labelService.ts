import { apiService } from '@/services/APIService';
import type { LabelResponse } from './labelTypes';

export class LabelService {
  static async getLabels(): Promise<LabelResponse> {
    const response = await apiService.get<LabelResponse>('labels');
    return response.data;
  }
}
