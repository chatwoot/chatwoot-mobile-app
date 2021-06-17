import Config from 'react-native-config';
import { Alert } from 'react-native';
import I18n from '../i18n';
export function checkServerSupport({ installedVersion, userRole }) {
  const minimumVersion = Config.MINIMUM_CHATWOOT_VERSION;
  if (installedVersion < minimumVersion) {
    if (userRole === 'administrator') {
      Alert.alert(
        I18n.t('SERVER_UPGRADE.TITLE'),
        I18n.t('SERVER_UPGRADE.WARNING_FOR_ADMIN', { minimumVersion }),
        [{ text: 'OK' }],
      );
    } else {
      Alert.alert(I18n.t('SERVER_UPGRADE.TITLE'), I18n.t('SERVER_UPGRADE.WARNING_FOR_AGENT'), [
        { text: 'OK' },
      ]);
    }
  }
}
