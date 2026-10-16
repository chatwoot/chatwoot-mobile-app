import reducer from '../settingsSlice';
import { settingsActions } from '../settingsActions';

jest.mock('@/utils/navigationUtils', () => ({ navigate: jest.fn() }));
jest.mock('@react-native-firebase/messaging', () => jest.fn());
jest.mock('react-native-permissions', () => jest.requireActual('react-native-permissions/mock'));
jest.mock('../../../../modules/app-update', () => ({}));

const SERVER_A = 'https://a.example.com/';
const SERVER_B = 'https://b.example.com/';

type State = ReturnType<typeof reducer>;

const versionRequested = (requestId: string, installationUrl: string = SERVER_A) => ({
  type: settingsActions.getChatwootVersion.pending.type,
  meta: { requestId, arg: { installationUrl } },
});

const versionFetched = (
  payload: object,
  requestId: string,
  installationUrl: string = SERVER_A,
) => ({
  type: settingsActions.getChatwootVersion.fulfilled.type,
  payload,
  meta: { requestId, arg: { installationUrl } },
});

const fetchVersion = (state: State, payload: object, requestId: string) =>
  reducer(reducer(state, versionRequested(requestId)), versionFetched(payload, requestId));

const installationUrlSet = (installationUrl: string) => ({
  type: settingsActions.setInstallationUrl.fulfilled.type,
  payload: { installationUrl, baseUrl: installationUrl, webSocketUrl: '' },
});

describe('settingsSlice getChatwootVersion', () => {
  const initialState = reducer(undefined, installationUrlSet(SERVER_A));

  it('stores the server version and mobile app minimum versions', () => {
    const state = fetchVersion(
      initialState,
      { version: '4.18.0', mobile_app: { min_version: { ios: '4.10.0', android: null } } },
      'r1',
    );
    expect(state.version).toBe('4.18.0');
    expect(state.mobileAppMinVersions).toEqual({ ios: '4.10.0', android: null });
  });

  it('clears the minimum versions when the server does not send them', () => {
    const withMinimum = fetchVersion(
      initialState,
      { version: '4.18.0', mobile_app: { min_version: { ios: '4.10.0' } } },
      'r1',
    );
    const state = fetchVersion(withMinimum, { version: '4.17.0' }, 'r2');
    expect(state.mobileAppMinVersions).toEqual({ ios: null, android: null });
  });

  it('clears the minimum versions when the installation URL changes', () => {
    const withMinimum = fetchVersion(
      initialState,
      { version: '4.18.0', mobile_app: { min_version: { ios: '4.10.0' } } },
      'r1',
    );
    const state = reducer(withMinimum, installationUrlSet(SERVER_B));
    expect(state.mobileAppMinVersions).toEqual({ ios: null, android: null });
  });

  it('ignores a response from a server the user has switched away from', () => {
    const requested = reducer(initialState, versionRequested('r1', SERVER_A));
    const onServerB = reducer(requested, installationUrlSet(SERVER_B));
    const state = reducer(
      onServerB,
      versionFetched({ version: '4.18.0', mobile_app: { min_version: { ios: '4.10.0' } } }, 'r1'),
    );
    expect(state.mobileAppMinVersions).toEqual({ ios: null, android: null });
    expect(state.version).toBe('');
  });

  it('ignores an older response that arrives after a newer one', () => {
    let state = reducer(initialState, versionRequested('old'));
    state = reducer(state, versionRequested('new'));
    state = reducer(
      state,
      versionFetched({ version: '4.18.0', mobile_app: { min_version: { ios: '4.10.0' } } }, 'new'),
    );
    state = reducer(state, versionFetched({ version: '4.18.0' }, 'old'));
    expect(state.mobileAppMinVersions).toEqual({ ios: '4.10.0', android: null });
  });
});
