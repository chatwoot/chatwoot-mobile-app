import Snackbar from 'react-native-snackbar';

export const showToast = ({ message }: { message: string }) => {
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_SHORT,
  });
};
