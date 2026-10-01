import { useCallback, useEffect, useState } from 'react';

// With a headset around, the speaker button becomes a route picker; the list closes on
// its own once there is no headset or no media to route
export const useAudioRoutePicker = (hasHeadset: boolean, isConnected: boolean) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!hasHeadset || !isConnected) setIsOpen(false);
  }, [hasHeadset, isConnected]);
  const toggle = useCallback(() => setIsOpen(open => !open), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, toggle, close };
};
