interface ToastParams {
  message: string;
}

let SnackbarModule: any = null;
let isSnackbarAvailable = true;

// Lazy load Snackbar to avoid module initialization errors in Expo Go
const getSnackbar = () => {
  if (!isSnackbarAvailable) {
    return null;
  }
  
  if (SnackbarModule === null) {
    try {
      SnackbarModule = require('react-native-snackbar').default;
      // Check if the native module is actually available
      if (!SnackbarModule || !SnackbarModule.LENGTH_SHORT) {
        isSnackbarAvailable = false;
        SnackbarModule = null;
      }
    } catch (error) {
      console.warn('Snackbar module not available:', error);
      isSnackbarAvailable = false;
      SnackbarModule = null;
    }
  }
  
  return SnackbarModule;
};

export const showToast = ({ message }: ToastParams): void => {
  const Snackbar = getSnackbar();
  
  if (!Snackbar) {
    console.warn('Snackbar is not available. Message:', message);
    return;
  }
  
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_SHORT,
  });
};
