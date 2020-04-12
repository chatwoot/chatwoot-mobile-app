import { store } from '../store';

export const getBaseUrl = async () => {
  try {
    const state = await store.getState();
    const { installationUrl } = state.settings;
    return installationUrl;
  } catch (error) {}
};
