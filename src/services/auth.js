import { getStore } from '@/store/storeAccessor';

export const getHeaders = async () => {
  try {
    const state = await getStore().getState();
    if (!state.auth.headers) {
      return;
    }
    const {
      headers: { 'access-token': accessToken, uid, client },
      user: { account_id: accountId },
    } = state.auth;
    return {
      'access-token': accessToken,
      uid,
      client,
      accountId,
    };
  } catch (error) {
    return null;
  }
};

export const getBaseUrl = async () => {
  try {
    const state = await getStore().getState();
    const { installationUrl } = state.settings;
    return installationUrl;
  } catch (error) {}
};

export const getPubSubToken = async () => {
  try {
    const state = await getStore().getState();
    const {
      user: { pubsub_token: pubSubToken },
    } = state.auth;

    return pubSubToken;
  } catch (error) {}
};

export const getUserDetails = async () => {
  try {
    const state = await getStore().getState();
    const {
      user: { id: userId, account_id: accountId, name, email },
    } = state.auth;
    return { accountId, userId, name, email };
  } catch (error) {}
};
