import { apiService } from '@/services/APIService';
import type { DashboardAppResponse } from './dashboardAppTypes';
import { transformDashboardApp } from '@/utils/camelCaseKeys';
import { DashboardApp } from '@/types';

export class DashboardAppService {
  static async index(): Promise<DashboardAppResponse> {
    const response = await apiService.get<DashboardApp[]>('dashboard_apps');
    const dashboardApps = response.data.map(transformDashboardApp);
    return {
      payload: dashboardApps,
    };
  }
}
