import { useCallback, useEffect, useState } from 'react';

export const useAudioRoutePicker = (hasHeadset: boolean, isConnected: boolean) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!hasHeadset || !isConnected) setIsOpen(false);
  }, [hasHeadset, isConnected]);
  const toggle = useCallback(() => setIsOpen(open => !open), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, toggle, close };
};
