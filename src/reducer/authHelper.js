import { getStore } from '../reducer/storeAccessor';

export const handleLogout = async () => {
  const store = await getStore();
  store.dispatch({ type: 'auth/logout' });
};
