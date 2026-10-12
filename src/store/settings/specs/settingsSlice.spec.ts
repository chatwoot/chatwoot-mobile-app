import reducer from '../settingsSlice';
import { settingsActions } from '../settingsActions';

jest.mock('@/utils/navigationUtils', () => ({ navigate: jest.fn() }));
jest.mock('@react-native-firebase/messaging', () => jest.fn());
jest.mock('react-native-permissions', () => jest.requireActual('react-native-permissions/mock'));
jest.mock('../../../../modules/app-update', () => ({}));

const versionFetched = (payload: object) => ({
  type: settingsActions.getChatwootVersion.fulfilled.type,
  payload,
});

describe('settingsSlice getChatwootVersion', () => {
  const initialState = reducer(undefined, { type: 'INIT' });

  it('stores the server version and mobile app minimum versions', () => {
    const state = reducer(
      initialState,
      versionFetched({
        version: '4.18.0',
        mobile_app: { min_version: { ios: '4.10.0', android: null } },
      }),
    );
    expect(state.version).toBe('4.18.0');
    expect(state.mobileAppMinVersions).toEqual({ ios: '4.10.0', android: null });
  });

  it('clears the minimum versions when the server does not send them', () => {
    const withMinimum = reducer(
      initialState,
      versionFetched({ version: '4.18.0', mobile_app: { min_version: { ios: '4.10.0' } } }),
    );
    const state = reducer(withMinimum, versionFetched({ version: '4.17.0' }));
    expect(state.mobileAppMinVersions).toEqual({ ios: null, android: null });
  });
});
