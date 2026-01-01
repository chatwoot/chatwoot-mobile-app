import { Alert } from 'react-native';

interface ToastParams {
  message: string;
}

let isSnackbarChecked = false;
let isSnackbarAvailable = false;

// Check if Snackbar is available once
const checkSnackbarAvailability = () => {
  if (isSnackbarChecked) {
    return isSnackbarAvailable;
  }
  
  isSnackbarChecked = true;
  
  try {
    const SnackbarModule = require('react-native-snackbar');
    // Verify the module and its properties exist
    if (SnackbarModule && SnackbarModule.default && typeof SnackbarModule.default.show === 'function') {
      // Try to access LENGTH_SHORT to ensure native module is loaded
      const testValue = SnackbarModule.default.LENGTH_SHORT;
      if (testValue !== null && testValue !== undefined) {
        isSnackbarAvailable = true;
        return true;
      }
    }
  } catch (error) {
    console.warn('Snackbar module not available:', error);
  }
  
  isSnackbarAvailable = false;
  return false;
};

export const showToast = ({ message }: ToastParams): void => {
  // Check availability first
  if (!checkSnackbarAvailability()) {
    // Fallback to Alert when Snackbar is not available (e.g., in Expo Go)
    Alert.alert('', message, [{ text: 'OK' }]);
    return;
  }
  
  try {
    const Snackbar = require('react-native-snackbar').default;
    Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT,
    });
  } catch (error) {
    console.warn('Error showing snackbar:', error);
    Alert.alert('', message, [{ text: 'OK' }]);
  }
};
