import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

interface URLParams {
  URL: string;
}

interface PhoneParams {
  phoneNumber: string;
}

interface EmailParams {
  email: string;
}

export const openURL = ({ URL }: URLParams): void => {
  if (!URL) {
    return;
  }
  WebBrowser.openBrowserAsync(URL);
};

export const openNumber = ({ phoneNumber }: PhoneParams): void => {
  Linking.openURL(`tel:${phoneNumber}`);
};

export const openEmail = ({ email }: EmailParams): void => {
  Linking.openURL(`mailto:${email}`);
};
