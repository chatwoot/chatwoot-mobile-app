import { useEffect } from 'react';

import { setRecentsScreenshotEnabled } from '@/services/voice/chatwootCalls';

// Stops Android saving the app's last frame while a call is up, so reopening the app
// never flashes an old call screen with a stale timer before the live one draws
export const useRecentsScreenshotGuard = (hasCall: boolean) => {
  useEffect(() => {
    if (!hasCall) return undefined;
    setRecentsScreenshotEnabled(false);
    return () => setRecentsScreenshotEnabled(true);
  }, [hasCall]);
};
