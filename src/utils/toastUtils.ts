import Snackbar from 'react-native-snackbar';

interface ToastParams {
  message: string;
}

export const showToast = ({ message }: ToastParams): void => {
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_SHORT,
  });
};
