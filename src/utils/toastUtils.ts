import { Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';

import { emitToast } from './toastEvents';

interface ToastParams {
  message: string;
}

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
