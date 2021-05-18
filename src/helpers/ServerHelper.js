import Config from 'react-native-config';
import { Alert } from 'react-native';
export function checkServerSupport({ installedVersion, userRole }) {
  const minimumVersion = Config.MINIMUM_CHATWOOT_VERSION;
  const title = 'Server upgrade required';
  let message = `It seems like  the chatwoot server version is unsupported for this app. Upgrading to server version ${minimumVersion} or later is required`;
  if (installedVersion < minimumVersion) {
    if (userRole === 'administrator') {
      Alert.alert(title, message, [{ text: 'OK' }]);
    } else {
      message =
        'It seems like the chatwoot server version is unsupported for this app. Please contact your administrator to upgrade your Chatwoot server.';
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  }
}
