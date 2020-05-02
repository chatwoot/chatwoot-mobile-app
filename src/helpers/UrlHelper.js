import { store } from '../store';
import { BASE_URL } from '../constants/url';

import { URL_REGEX } from '../constants';

export const getBaseUrl = async () => {
  try {
    const state = await store.getState();
    const { installationUrl } = state.settings;
    return installationUrl;
  } catch (error) {}
};

export const checkUrlIsConversation = async ({ url }) => {
  const conversationsUrlRegex = new RegExp(
    `^${BASE_URL}${URL_REGEX.CONVERSATION}`,
  );
  return conversationsUrlRegex.test(url);
};
