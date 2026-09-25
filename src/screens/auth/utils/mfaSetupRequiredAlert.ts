import { Alert } from 'react-native';
import i18n from '@/i18n';
import { openURL } from '@/utils/urlUtils';

// Shown when sign-in answers with mfa_setup_required: the account enforces two-factor
// authentication and this user enrols on the web app before mobile can issue a session.
export const showMfaSetupRequiredAlert = (installationUrl: string) => {
  Alert.alert(
    i18n.t('LOGIN.MFA_SETUP_REQUIRED.TITLE'),
    i18n.t('LOGIN.MFA_SETUP_REQUIRED.MESSAGE'),
    [
      {
        text: i18n.t('LOGIN.MFA_SETUP_REQUIRED.OPEN_WEB'),
        onPress: () => openURL({ URL: installationUrl }),
      },
      { text: i18n.t('LOGIN.MFA_SETUP_REQUIRED.DISMISS'), style: 'cancel' },
    ],
  );
};
