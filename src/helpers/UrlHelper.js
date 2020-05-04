import { store } from '../store';

import { URL_REGEX } from '../constants';

export const getBaseUrl = async () => {
  try {
    const state = await store.getState();
    const { installationUrl } = state.settings;
    return installationUrl;
  } catch (error) {}
};

export const checkUrlIsConversation = async ({ url }) => {
  const state = await store.getState();
  const { installationUrl } = state.settings;

  const conversationsUrlRegex = new RegExp(
    `^${installationUrl}${URL_REGEX.CONVERSATION}`,
  );
  return conversationsUrlRegex.test(url);
};
