import { Alert, Platform, Linking } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { getApiLevel } from 'react-native-device-info';
import i18n from '@/i18n';

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // Android 13+ requires explicit permission
      const apiLevel = await getApiLevel();

      if (apiLevel > 32) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: i18n.t('NOTIFICATIONS.PERMISSION_TITLE'),
            message: i18n.t('NOTIFICATIONS.PERMISSION_MESSAGE'),
            buttonNeutral: i18n.t('NOTIFICATIONS.PERMISSION_ASK_LATER'),
            buttonNegative: i18n.t('NOTIFICATIONS.PERMISSION_CANCEL'),
            buttonPositive: i18n.t('NOTIFICATIONS.PERMISSION_OK'),
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }
    }

    // Request FCM permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
};

export const showPermissionRationale = () => {
  Alert.alert(i18n.t('NOTIFICATIONS.RATIONALE_TITLE'), i18n.t('NOTIFICATIONS.RATIONALE_MESSAGE'), [
    {
      text: i18n.t('NOTIFICATIONS.RATIONALE_CANCEL'),
      style: 'cancel',
    },
    {
      text: i18n.t('NOTIFICATIONS.RATIONALE_SETTINGS'),
      onPress: () => {
        // Open app settings
        if (Platform.OS === 'ios') {
          Linking.openURL('app-settings:');
        } else {
          Linking.openSettings();
        }
      },
    },
  ]);
};
