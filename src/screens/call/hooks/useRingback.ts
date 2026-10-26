import { useEffect } from 'react';

import { useAppSelector } from '@/hooks';
import { selectIsRingingBack } from '@/store/call/callSelectors';
import { startRingback, stopRingback } from '@/services/voice/chatwootCalls';

export const useRingback = () => {
  const ringing = useAppSelector(selectIsRingingBack);

  useEffect(() => {
    if (ringing) startRingback();
    else stopRingback();
    return () => {
      stopRingback();
    };
  }, [ringing]);
};
