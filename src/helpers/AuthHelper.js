import { store } from '../store';

export const getHeaders = async () => {
  try {
    const state = await store.getState();
    const {
      headers: { 'access-token': accessToken, uid, client },
    } = state.auth;
    return {
      'access-token': accessToken,
      uid: uid,
      client: client,
    };
  } catch (error) {}
};
