import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { RecentSearches } from '@/screens/search/utils/recentSearches';
import { logout } from '@/store/auth/authSlice';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectPushToken } from '@/store/settings/settingsSelectors';

/** Signs the user out: clears local session data, unregisters push, then resets auth state. */
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const pushToken = useAppSelector(selectPushToken);

  return useCallback(async () => {
    await AsyncStorage.removeItem('cwCookie');
    await RecentSearches.clearAll();
    await dispatch(settingsActions.removeDevice({ pushToken }));
    dispatch(logout());
  }, [dispatch, pushToken]);
};
