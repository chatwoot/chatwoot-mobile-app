import { useEffect } from 'react';

import { setRecentsScreenshotEnabled } from '@/services/voice/chatwootCalls';

// Call snapshots outlive their displayed state.
export const useRecentsScreenshotGuard = (hasCall: boolean) => {
  useEffect(() => {
    if (!hasCall) return undefined;
    setRecentsScreenshotEnabled(false);
    return () => setRecentsScreenshotEnabled(true);
  }, [hasCall]);
};
