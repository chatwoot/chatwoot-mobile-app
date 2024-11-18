import type { Team } from '@/types';
import { apiService } from '@/services/APIService';

export class TeamService {
  static async getTeams(): Promise<Team[]> {
    const response = await apiService.get<Team[]>('teams');
    return response.data;
  }
}
