import { useEffect, useState } from 'react';

export const useRingingFor = (since?: number) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!since) return undefined;
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - since) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [since]);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
