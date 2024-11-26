import { apiService } from '@/services/APIService';
import type { LabelResponse } from './labelTypes';
import { transformLabel } from '@/utils/camelCaseKeys';

export class LabelService {
  static async index(): Promise<LabelResponse> {
    const response = await apiService.get<LabelResponse>('labels');
    const labels = response.data.payload.map(transformLabel);
    return {
      payload: labels,
    };
  }
}
