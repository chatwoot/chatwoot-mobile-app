import { getStore } from '../reducer/storeAccessor';
import { logout } from '../reducer/authSlice';

export const handleLogout = async () => {
  const store = await getStore();
  store.dispatch(logout());
};

export const getHeaders = async () => {
  try {
    const state = await getStore().getState();
    if (!state.auth.headers) {
      return;
    }
    const {
      headers: { 'access-token': accessToken, uid, client },
      currentUser: { account_id: accountId },
    } = state.auth;
    return {
      'access-token': accessToken,
      uid,
      client,
      accountId,
    };
  } catch (error) {
    console.log('error:', error);
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
    const state = getStore().getState();
    const {
      currentUser: { pubsub_token: pubSubToken },
    } = state.auth;

    return pubSubToken;
  } catch (error) {}
};

export const getUserDetails = async () => {
  try {
    const state = await getStore().getState();
    const {
      currentUser: { id: userId, account_id: accountId, name, email },
    } = state.auth;
    return { accountId, userId, name, email };
  } catch (error) {}
};
