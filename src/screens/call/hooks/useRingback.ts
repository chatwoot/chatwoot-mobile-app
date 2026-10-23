import { useEffect } from 'react';

import { useAppSelector } from '@/hooks';
import { selectIsRingingBack } from '@/store/call/callSelectors';
import { startRingback, stopRingback } from '@/services/voice/chatwootCalls';

// Plays a ringback while a WhatsApp call this device placed rings at the contact's end,
// until it is answered or ends
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
