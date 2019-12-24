import Snackbar from 'react-native-snackbar';

export const showToast = ({ message }) => {
  Snackbar.show({
    title: message,
    duration: Snackbar.LENGTH_SHORT,
  });
};
