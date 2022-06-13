import SafariView from 'react-native-safari-view';

import { Platform, Linking } from 'react-native';

import { store } from '../store';

import { URL_REGEX } from '../constants';

export const getBaseUrl = async () => {
  try {
    const state = await store.getState();
    const { installationUrl } = state.settings;
    return installationUrl;
  } catch (error) {}
};

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
  if (Platform.OS === 'ios') {
    SafariView.show({
      url: URL,
    });
  } else {
    Linking.openURL(URL);
  }
};

export const openNumber = ({ Number }) => {
  Linking.openURL(`tel:${Number}`);
};
