import { Alert } from 'react-native';
// @ts-expect-error semver package lacks TypeScript definitions
import semver from 'semver';

import I18n from '@/i18n';
import { BrandTokens } from '@/theme';

interface VersionCheck {
  installedVersion: string;
  minimumVersion: string;
}

interface ServerSupportCheck extends Pick<VersionCheck, 'installedVersion'> {
  userRole?: 'administrator' | string;
}

export const checkShouldShowServerUpgradeWarning = ({
  installedVersion,
  minimumVersion,
}: VersionCheck): boolean => {
  try {
    return semver.lt(installedVersion, minimumVersion);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};

const minimumVersion: string | undefined = BrandTokens.version;

export function checkServerSupport({ installedVersion, userRole }: ServerSupportCheck): void {
  const versionToCheck = minimumVersion || '2.7.0';
  if (!installedVersion) {
    return;
  }
  const shouldShowServerUpgradeWarning = semver.lt(installedVersion, versionToCheck);
  if (shouldShowServerUpgradeWarning) {
    if (userRole === 'administrator') {
      Alert.alert(
        I18n.t('SERVER_UPGRADE.TITLE'),
        I18n.t('SERVER_UPGRADE.WARNING_FOR_ADMIN', {
          minimumVersion,
          appName: BrandTokens.name,
        }),
        [{ text: 'OK' }],
      );
    } else {
      Alert.alert(
        I18n.t('SERVER_UPGRADE.TITLE'),
        I18n.t('SERVER_UPGRADE.WARNING_FOR_AGENT', { appName: BrandTokens.name }),
        [{ text: 'OK' }],
      );
    }
  }
}
