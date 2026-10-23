import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useAppDispatch } from '@/hooks';
import { settingsActions } from '@/store/settings/settingsActions';
import { systemCall } from '@/services/voice/systemCall';
import { addVoipTokenListener, getVoipToken } from '@/services/voice/chatwootCalls';

// Keeps the server's copy of the VoIP push token current for this login. A token counts
// as registered only once the server has accepted it; a failed registration is tried
// again the next time the app comes to the foreground. The mount registration and the
// token event can carry the same token, which is sent once.
export const useVoipTokenRegistration = () => {
  const dispatch = useAppDispatch();
  const registeredTokenRef = useRef<string | null>(null);
  const pendingTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!systemCall.isAvailable()) return undefined;
    const register = (token: string | null) => {
      if (!token || token === registeredTokenRef.current || token === pendingTokenRef.current) {
        return;
      }
      pendingTokenRef.current = token;
      dispatch(settingsActions.saveVoipToken())
        .unwrap()
        .then(() => {
          registeredTokenRef.current = token;
        })
        .catch(() => {})
        .finally(() => {
          if (pendingTokenRef.current === token) pendingTokenRef.current = null;
        });
    };
    register(getVoipToken() ?? null);
    const tokenSubscription = addVoipTokenListener(event => register(event.token));
    const appStateSubscription = AppState.addEventListener('change', next => {
      if (next === 'active') register(getVoipToken() ?? null);
    });
    return () => {
      tokenSubscription.remove();
      appStateSubscription.remove();
    };
  }, [dispatch]);
};
