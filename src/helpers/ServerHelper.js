import Config from 'react-native-config';

export function checkServerSupport({ installedVersion, userRole }) {
  const minimumVersion = Config.MINIMUM_CHATWOOT_VERSION;
  if (installedVersion < minimumVersion) {
    if (userRole === 'administrator') {
      // showServerUpgradeMessageForAdmin({ message: '' });
    } else {
      // showServerUpgradeMessage({ message: '' });
    }
  }
}
