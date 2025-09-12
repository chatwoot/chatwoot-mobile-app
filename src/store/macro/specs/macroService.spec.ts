import { apiService } from '@/services/APIService';
import { MacroService } from '../macroService';
import { mockMacrosResponse } from './macroMockData';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('MacroService', () => {
  it('should fetch macros successfully', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce(mockMacrosResponse);

    const response = await MacroService.index();
    expect(apiService.get).toHaveBeenCalledWith('macros');
    expect(response).toEqual(mockMacrosResponse.data);
  });
});
