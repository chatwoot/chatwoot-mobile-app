import { useEffect, useRef } from 'react';

import { useAppDispatch } from '@/hooks';
import { settingsActions } from '@/store/settings/settingsActions';
import { systemCall } from '@/services/voice/systemCall';
import { addVoipTokenListener, getVoipToken } from '@/services/voice/chatwootCalls';

// Keeps the server's copy of the VoIP push token current for this login. The mount
// registration and the token event can carry the same token, which is sent once.
export const useVoipTokenRegistration = () => {
  const dispatch = useAppDispatch();
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!systemCall.isAvailable()) return undefined;
    const register = (token: string | null) => {
      if (!token || token === registeredTokenRef.current) return;
      registeredTokenRef.current = token;
      dispatch(settingsActions.saveVoipToken());
    };
    register(getVoipToken() ?? null);
    const subscription = addVoipTokenListener(event => register(event.token));
    return () => subscription.remove();
  }, [dispatch]);
};
