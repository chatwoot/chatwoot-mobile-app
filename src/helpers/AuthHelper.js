import { store } from '../store';

export const getHeaders = async () => {
  try {
    const state = await store.getState();
    const {
      headers: { 'access-token': accessToken, uid, client },
      user: { account_id: accountId },
    } = state.auth;
    return {
      'access-token': accessToken,
      uid: uid,
      client: client,
      accountId,
    };
  } catch (error) {}
};

export const getPubSubToken = async () => {
  try {
    const state = await store.getState();
    const {
      user: { pubsub_token: pubSubToken },
    } = state.auth;

    return pubSubToken;
  } catch (error) {}
};

export const getUserDetails = async () => {
  try {
    const state = await store.getState();
    const {
      user: { id: userId, account_id: accountId, name, email },
    } = state.auth;
    return { accountId, userId, name, email };
  } catch (error) {}
};
