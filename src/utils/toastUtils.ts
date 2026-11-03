import { Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';

import { emitToast } from './toastEvents';

interface ToastParams {
  message: string;
}

// iOS: a glass capsule under the status bar (GlassToastHost). Android keeps the snackbar.
export const showToast = ({ message }: ToastParams): void => {
  if (Platform.OS === 'ios') {
    emitToast(message);
    return;
  }
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_SHORT,
  });
};
