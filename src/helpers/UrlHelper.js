import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { URL_REGEX } from '../constants';

export const getConversationUrl = async ({ conversationId, accountId }) => {
  try {
    const baseURL = await getBaseUrl();
    const conversationURL = `${baseURL}app/accounts/${accountId}/conversations/${conversationId}`;
    return conversationURL;
  } catch (error) {
    // error
  }
};

export const checkUrlIsConversation = async ({ url }) => {
  const installationUrl = await getBaseUrl();
  const conversationsUrlRegex = new RegExp(`^${installationUrl}${URL_REGEX.CONVERSATION}`);
  return conversationsUrlRegex.test(url);
};

export const openURL = ({ URL }) => {
  if (!URL) {
    return;
  }
  WebBrowser.openBrowserAsync(URL);
};

export const openNumber = ({ phoneNumber }) => {
  Linking.openURL(`tel:${phoneNumber}`);
};
