import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { URL_REGEX } from '@/constants';

export const openURL = ({ URL }) => {
  if (!URL) {
    return;
  }
  WebBrowser.openBrowserAsync(URL);
};

export const openNumber = ({ phoneNumber }) => {
  Linking.openURL(`tel:${phoneNumber}`);
};

export const openEmail = ({ email }) => {
  Linking.openURL(`mailto:${email}`);
};
