import { useEffect, useState } from 'react';

import { formatCallDuration } from '@/utils/voiceCallUtils';

// Seconds since the call went active, ticking once a second
export const useCallDuration = (activeSince?: number) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!activeSince) {
      setElapsed(0);
      return undefined;
    }
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - activeSince) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeSince]);
  return formatCallDuration(elapsed);
};
