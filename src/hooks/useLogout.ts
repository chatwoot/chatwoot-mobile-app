import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { RecentSearches } from '@/screens/search/utils/recentSearches';
import { getVoipToken } from '@/services/voice/chatwootCalls';
import { logout } from '@/store/auth/authSlice';
import { callActions } from '@/store/call/callActions';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectPushToken } from '@/store/settings/settingsSelectors';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const pushToken = useAppSelector(selectPushToken);

  return useCallback(async () => {
    // Server hangup requires the current session.
    await dispatch(callActions.endLocalCalls()).catch(() => {});
    await AsyncStorage.removeItem('cwCookie');
    await RecentSearches.clearAll();
    await dispatch(settingsActions.removeDevice({ pushToken }));
    const voipToken = getVoipToken();
    if (voipToken) await dispatch(settingsActions.removeDevice({ pushToken: voipToken }));
    dispatch(logout());
  }, [dispatch, pushToken]);
};
