import type { AxiosAdapter } from 'axios';
import { showToast } from '@/utils/toastUtils';
import { apiService } from '../APIService';

jest.mock('@/utils/toastUtils', () => ({ showToast: jest.fn() }));
jest.mock('@/i18n', () => ({ t: (key: string) => key }));
jest.mock('@/store/storeAccessor', () => ({
  getStore: () => ({
    getState: () => ({
      auth: { headers: null, user: { account_id: 1 } },
      settings: { installationUrl: 'https://chat.example.com/' },
    }),
    dispatch: jest.fn(),
  }),
}));

const respondWith =
  (contentType: string, data: string): AxiosAdapter =>
  async config => ({
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': contentType },
    data,
    config,
  });

const useAdapter = (adapter: AxiosAdapter) => {
  (apiService as unknown as { api: { defaults: { adapter: AxiosAdapter } } }).api.defaults.adapter =
    adapter;
};

describe('APIService responses', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects a 2xx HTML page and reports it like a failed request', async () => {
    useAdapter(respondWith('text/html; charset=utf-8', '<!DOCTYPE html><title>Sign in</title>'));

    await expect(apiService.get('conversations/1')).rejects.toMatchObject({
      message: 'Expected JSON, received an HTML page',
      response: { status: 200 },
    });
    expect(showToast).toHaveBeenCalledWith({ message: 'ERRORS.COMMON_ERROR' });
  });

  it('returns JSON responses', async () => {
    useAdapter(respondWith('application/json; charset=utf-8', '{"id":1}'));

    const response = await apiService.get('conversations/1');

    expect(response.data).toEqual({ id: 1 });
    expect(showToast).not.toHaveBeenCalled();
  });
});
