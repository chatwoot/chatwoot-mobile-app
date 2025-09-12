import { checkShouldShowServerUpgradeWarning } from '../serverUtils';

describe('ServerHelper', () => {
  it('returns true if installed version is less than minimum version', () => {
    expect(
      checkShouldShowServerUpgradeWarning({ installedVersion: '3.3.0', minimumVersion: '3.4.0' }),
    ).toBe(true);
  });

  it('returns false if installed version is greater than minimum version', () => {
    expect(
      checkShouldShowServerUpgradeWarning({ installedVersion: '3.4.0', minimumVersion: '3.3.0' }),
    ).toBe(false);
  });

  it('returns false if installed version is equal to minimum version', () => {
    expect(
      checkShouldShowServerUpgradeWarning({ installedVersion: '3.4.0', minimumVersion: '3.4.0' }),
    ).toBe(false);
  });

  it('returns false if installed version is not a valid semver', () => {
    expect(
      checkShouldShowServerUpgradeWarning({ installedVersion: 'invalid', minimumVersion: '3.4.0' }),
    ).toBe(false);
  });
});
