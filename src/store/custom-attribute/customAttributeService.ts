import { apiService } from '@/services/APIService';
import type { CustomAttributeResponse } from './customAttributeTypes';
import { transformCustomAttribute } from '@/utils/camelCaseKeys';
import { CustomAttribute } from '@/types';

export class CustomAttributeService {
  static async index(): Promise<CustomAttributeResponse> {
    const response = await apiService.get<CustomAttribute[]>('custom_attribute_definitions');
    const customAttributes = response.data.map(transformCustomAttribute);
    return {
      payload: customAttributes,
    };
  }
}
