import { useEffect } from 'react';
import { BackHandler } from 'react-native';

// Back tucks the call away into the banner; over a lock screen it does nothing, since
// the app behind the call screen must stay out of reach
export const useHardwareBackToMinimise = (isLocked: boolean, onMinimise: () => void) => {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isLocked) onMinimise();
      return true;
    });
    return () => subscription.remove();
  }, [isLocked, onMinimise]);
};
