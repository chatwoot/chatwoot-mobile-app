import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  canInstallRelease,
  consumeUpdatedVersion,
  fetchAppStoreRelease,
  getMinVersionForPlatform,
  isUpdatePromptSnoozed,
  isVersionLower,
  markRestartForUpdate,
  markSignedInThisSession,
  snoozeUpdatePrompt,
  wasSignedInThisSession,
} from '../appUpdateUtils';

jest.mock('../../../modules/app-update', () => ({
  presentAppStorePage: jest.fn(),
}));

const DAY = 24 * 60 * 60 * 1000;

describe('isVersionLower', () => {
  it('compares versions numerically', () => {
    expect(isVersionLower('4.9.6', '4.10.0')).toBe(true);
    expect(isVersionLower('4.10.0', '4.9.6')).toBe(false);
    expect(isVersionLower('4.10.0', '4.10.0')).toBe(false);
  });

  it('accepts versions without a patch number', () => {
    expect(isVersionLower('4.9', '4.10')).toBe(true);
  });

  it('returns false when either version is missing or invalid', () => {
    expect(isVersionLower('4.9.6', null)).toBe(false);
    expect(isVersionLower('', '4.10.0')).toBe(false);
    expect(isVersionLower('4.9.6', 'latest')).toBe(false);
  });
});

describe('getMinVersionForPlatform', () => {
  const minVersions = { ios: '4.10.0', android: '4.9.8' };

  it('returns the minimum for the given platform', () => {
    expect(getMinVersionForPlatform(minVersions, 'ios')).toBe('4.10.0');
    expect(getMinVersionForPlatform(minVersions, 'android')).toBe('4.9.8');
  });

  it('returns null when the server sets no minimum or an invalid one', () => {
    expect(getMinVersionForPlatform({ ios: null, android: null }, 'ios')).toBeNull();
    expect(getMinVersionForPlatform(undefined, 'android')).toBeNull();
    expect(getMinVersionForPlatform({ ios: 'soon' }, 'ios')).toBeNull();
  });
});

describe('canInstallRelease', () => {
  const release = { version: '4.10.0', minimumOsVersion: '16.4' };

  it('allows devices at or above the minimum OS version', () => {
    expect(canInstallRelease(release, '16.4')).toBe(true);
    expect(canInstallRelease(release, '18.2')).toBe(true);
  });

  it('rejects devices below the minimum OS version', () => {
    expect(canInstallRelease(release, '15.8')).toBe(false);
  });
});

describe('fetchAppStoreRelease', () => {
  const mockFetch = (body: unknown, ok = true) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(body),
    }) as jest.Mock;
  };

  it('returns the latest release from the lookup', async () => {
    mockFetch({ resultCount: 1, results: [{ version: '4.10.0', minimumOsVersion: '16.4' }] });
    await expect(fetchAppStoreRelease()).resolves.toEqual({
      version: '4.10.0',
      minimumOsVersion: '16.4',
    });
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(
      /^https:\/\/itunes\.apple\.com\/lookup\?id=1495796682&_=\d+$/,
    );
  });

  it('returns null when the lookup has no results', async () => {
    mockFetch({ resultCount: 0, results: [] });
    await expect(fetchAppStoreRelease()).resolves.toBeNull();
  });

  it('throws when the lookup fails', async () => {
    mockFetch({}, false);
    await expect(fetchAppStoreRelease()).rejects.toThrow('status 500');
  });
});

describe('update prompt snooze', () => {
  beforeEach(() => AsyncStorage.clear());

  it('is not snoozed by default', async () => {
    await expect(isUpdatePromptSnoozed()).resolves.toBe(false);
  });

  it('snoozes for three days', async () => {
    const now = 1_000_000;
    await snoozeUpdatePrompt(now);
    await expect(isUpdatePromptSnoozed(now + 3 * DAY - 1)).resolves.toBe(true);
    await expect(isUpdatePromptSnoozed(now + 3 * DAY)).resolves.toBe(false);
  });
});

describe('consumeUpdatedVersion', () => {
  beforeEach(() => AsyncStorage.clear());

  it('returns the new version once after an update restart', async () => {
    await markRestartForUpdate('4.9.6');
    await expect(consumeUpdatedVersion('4.10.0')).resolves.toBe('4.10.0');
    await expect(consumeUpdatedVersion('4.10.0')).resolves.toBeNull();
  });

  it('returns null when the version did not change', async () => {
    await markRestartForUpdate('4.9.6');
    await expect(consumeUpdatedVersion('4.9.6')).resolves.toBeNull();
  });

  it('returns null without a restart marker', async () => {
    await expect(consumeUpdatedVersion('4.10.0')).resolves.toBeNull();
  });

  it('keeps a marker written while the previous one is being read', async () => {
    await markRestartForUpdate('4.9.0');
    const read = consumeUpdatedVersion('4.9.6');
    const write = markRestartForUpdate('4.9.6');
    await Promise.all([read, write]);
    await expect(consumeUpdatedVersion('4.10.0')).resolves.toBe('4.10.0');
  });
});

describe('sign-in during the session', () => {
  it('is false until a sign-in is recorded', () => {
    expect(wasSignedInThisSession()).toBe(false);
    markSignedInThisSession();
    expect(wasSignedInThisSession()).toBe(true);
  });
});
