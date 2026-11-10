import { useEffect } from 'react';
import { BackHandler } from 'react-native';

// Back must not expose locked content.
export const useHardwareBackToMinimise = (onLockScreen: boolean, onMinimise: () => void) => {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!onLockScreen) onMinimise();
      return true;
    });
    return () => subscription.remove();
  }, [onLockScreen, onMinimise]);
};
