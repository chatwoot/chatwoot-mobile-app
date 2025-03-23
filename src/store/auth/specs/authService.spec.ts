import { AuthService } from '@/store/auth/authService';
import { apiService } from '@/services/APIService';
import { mockUser } from './authMockData';
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

describe('AuthService', () => {
  const mockHeaders = {
    'access-token': 'token',
    uid: 'uid',
    client: 'client',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should make a POST request to login endpoint', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockResponse = {
        data: { data: mockUser },
        headers: mockHeaders,
      };

      (apiService.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.login(credentials);

      expect(apiService.post).toHaveBeenCalledWith('auth/sign_in', credentials);
      expect(result).toEqual({
        user: mockUser,
        headers: mockHeaders,
      });
    });

    it('should throw error when login fails', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      const error = new Error('Invalid credentials');

      (apiService.post as jest.Mock).mockRejectedValueOnce(error);

      await expect(AuthService.login(credentials)).rejects.toThrow(error);
    });
  });
  describe('getProfile', () => {
    it('should make a GET request to profile endpoint', async () => {
      const mockResponse = { data: mockUser };

      (apiService.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.getProfile();

      expect(apiService.get).toHaveBeenCalledWith('profile');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when getProfile fails', async () => {
      const error = new Error('Failed to fetch profile');

      (apiService.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(AuthService.getProfile()).rejects.toThrow(error);
    });
  });

  describe('resetPassword', () => {
    it('should make a POST request to reset password endpoint', async () => {
      const payload = { email: 'test@example.com' };
      const mockResponse = { data: { message: 'Password reset email sent' } };

      (apiService.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.resetPassword(payload);

      expect(apiService.post).toHaveBeenCalledWith('auth/password', payload);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when resetPassword fails', async () => {
      const payload = { email: 'test@example.com' };
      const error = new Error('Failed to reset password');

      (apiService.post as jest.Mock).mockRejectedValueOnce(error);

      await expect(AuthService.resetPassword(payload)).rejects.toThrow(error);
    });
  });

  describe('updateAvailability', () => {
    it('should make a POST request to update availability endpoint', async () => {
      const payload = { profile: { availability: 'available', account_id: '1' } };
      const mockResponse = { data: mockUser };

      (apiService.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.updateAvailability(payload);

      expect(apiService.post).toHaveBeenCalledWith('profile/availability', payload);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when updateAvailability fails', async () => {
      const payload = { profile: { availability: 'available', account_id: '1' } };
      const error = new Error('Failed to update availability');

      (apiService.post as jest.Mock).mockRejectedValueOnce(error);

      await expect(AuthService.updateAvailability(payload)).rejects.toThrow(error);
    });
  });
});
