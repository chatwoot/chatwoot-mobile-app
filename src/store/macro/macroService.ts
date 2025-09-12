import { apiService } from '@/services/APIService';
import type { MacroResponse } from './macroTypes';
import { transformMacro } from '@/utils/camelCaseKeys';

export class MacroService {
  static async index(): Promise<MacroResponse> {
    const response = await apiService.get<MacroResponse>('macros');
    const macros = response.data.payload.map(transformMacro);
    return {
      payload: macros,
    };
  }

  static async executeMacro(macroId: number, conversationIds: number[]): Promise<void> {
    await apiService.post(`macros/${macroId}/execute`, {
      conversation_ids: conversationIds,
    });
  }
}
