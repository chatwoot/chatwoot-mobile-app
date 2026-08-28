import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import i18n from '@/i18n';
import { showToast } from '@/utils/toastUtils';

interface URLParams {
  URL: string;
}

interface PhoneParams {
  phoneNumber: string;
}

interface EmailParams {
  email: string;
}

const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const WEB_SCHEME_PATTERN = /^https?:/i;

/**
 * Opens a target in whichever app the system has registered for its scheme.
 * A device without a handler rejects, which surfaces as a toast rather than an
 * unhandled rejection.
 */
const openWithSystemHandler = async (target: string): Promise<void> => {
  try {
    await Linking.openURL(target);
  } catch {
    showToast({ message: i18n.t('ERRORS.UNABLE_TO_OPEN_LINK') });
  }
};

/**
 * Targets come from message content, so a link can arrive without a scheme or
 * with one the in-app browser rejects. A scheme-less target is treated as https,
 * web targets open in the in-app browser, and anything else goes to the system
 * handler. The in-app browser also fails when the device has no activity willing
 * to serve the intent, so the system handler is the fallback for that too.
 */
export const openURL = async ({ URL }: URLParams): Promise<void> => {
  const target = URL?.trim();
  if (!target) {
    return;
  }

  const absoluteURL = SCHEME_PATTERN.test(target) ? target : `https://${target}`;

  if (WEB_SCHEME_PATTERN.test(absoluteURL)) {
    try {
      await WebBrowser.openBrowserAsync(absoluteURL);
      return;
    } catch {
      // Falls through to the system handler.
    }
  }

  await openWithSystemHandler(absoluteURL);
};

export const openNumber = ({ phoneNumber }: PhoneParams): void => {
  openWithSystemHandler(`tel:${phoneNumber}`);
};

export const openEmail = ({ email }: EmailParams): void => {
  openWithSystemHandler(`mailto:${email}`);
};
