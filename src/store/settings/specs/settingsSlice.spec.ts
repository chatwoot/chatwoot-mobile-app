import reducer from '../settingsSlice';
import { settingsActions } from '../settingsActions';

jest.mock('@/utils/navigationUtils', () => ({ navigate: jest.fn() }));
jest.mock('@react-native-firebase/messaging', () => jest.fn());
jest.mock('react-native-permissions', () => jest.requireActual('react-native-permissions/mock'));
jest.mock('../../../../modules/app-update', () => ({}));

const SERVER_A = 'https://a.example.com/';
const SERVER_B = 'https://b.example.com/';

const versionFetched = (payload: object, installationUrl: string = SERVER_A) => ({
  type: settingsActions.getChatwootVersion.fulfilled.type,
  payload,
  meta: { arg: { installationUrl } },
});

const installationUrlSet = (installationUrl: string) => ({
  type: settingsActions.setInstallationUrl.fulfilled.type,
  payload: { installationUrl, baseUrl: installationUrl, webSocketUrl: '' },
});

describe('settingsSlice getChatwootVersion', () => {
  const initialState = reducer(undefined, installationUrlSet(SERVER_A));

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

  it('clears the minimum versions when the installation URL changes', () => {
    const withMinimum = reducer(
      initialState,
      versionFetched({ version: '4.18.0', mobile_app: { min_version: { ios: '4.10.0' } } }),
    );
    const state = reducer(withMinimum, installationUrlSet(SERVER_B));
    expect(state.mobileAppMinVersions).toEqual({ ios: null, android: null });
  });

  it('ignores a response from a server the user has switched away from', () => {
    const onServerB = reducer(initialState, installationUrlSet(SERVER_B));
    const state = reducer(
      onServerB,
      versionFetched(
        { version: '4.18.0', mobile_app: { min_version: { ios: '4.10.0' } } },
        SERVER_A,
      ),
    );
    expect(state.mobileAppMinVersions).toEqual({ ios: null, android: null });
    expect(state.version).toBe('');
  });
});
