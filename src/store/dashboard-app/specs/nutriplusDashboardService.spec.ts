import { NutriplusDashboardService } from '../nutriplusDashboardService';
import { apiService } from '@/services/APIService';

jest.mock('@/services/APIService', () => ({
  apiService: {
    post: jest.fn(),
  },
}));

describe('NutriplusDashboardService', () => {
  it('requests a secure bootstrap token for the current conversation', async () => {
    const bootstrap = { token: 'signed-token', expires_in: 300 };
    (apiService.post as jest.Mock).mockResolvedValueOnce({ data: bootstrap });

    const result = await NutriplusDashboardService.bootstrap(189);

    expect(apiService.post).toHaveBeenCalledWith('nutriplus/bootstrap', {
      conversation_id: 189,
    });
    expect(result).toEqual(bootstrap);
  });
});
