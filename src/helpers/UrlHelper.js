import SafariView from 'react-native-safari-view';

import { Platform, Linking } from 'react-native';

import { store } from '../store';

import { Share } from 'react-native';

import { URL_REGEX } from '../constants';

export const getBaseUrl = async () => {
  try {
    const state = await store.getState();
    const { installationUrl } = state.settings;
    return installationUrl;
  } catch (error) {}
};

export const getConversationUrl = async () => {
  try {
    const state = await store.getState();
    const baseURL = await getBaseUrl();
    const accountId = state.conversation.conversationDetails.account_id;
    const conversationId = state.conversation.conversationDetails.id;
    const conversationURL = await Share.share({
      url: baseURL + 'app/accounts/' + accountId + '/conversations/' + conversationId,
    });
    return conversationURL;
  } catch (error) {
    // error
  }
};

export const checkUrlIsConversation = async ({ url }) => {
  const state = await store.getState();
  const { installationUrl } = state.settings;

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
