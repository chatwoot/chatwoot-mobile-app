import type { Team } from '@/types';
import { apiService } from '@/services/APIService';
import { transformTeam } from '@/utils/camelCaseKeys';

export class TeamService {
  static async getTeams(): Promise<Team[]> {
    const response = await apiService.get<Team[]>('teams');
    const teams = response.data.map(transformTeam);
    return teams;
  }
}
