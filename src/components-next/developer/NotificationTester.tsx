import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  sendTestForegroundNotification, 
  checkNotificationPermissions, 
  getFCMToken,
  runNotificationTest 
} from '@/utils/testNotifications';

interface NotificationTesterProps {
  visible?: boolean;
}

export const NotificationTester: React.FC<NotificationTesterProps> = ({ visible = __DEV__ }) => {
  const [isRunning, setIsRunning] = useState(false);

  if (!visible) {
    return null;
  }



  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      await runNotificationTest();
    } finally {
      setIsRunning(false);
    }
  };

  const handleTestForeground = async () => {
    await sendTestForegroundNotification();
  };

  const handleCheckPermissions = async () => {
    await checkNotificationPermissions();
  };

  const handleGetToken = async () => {
    await getFCMToken();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🧪 Notification Tester (Dev Only)
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.blueButton}
          onPress={handleRunTest}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run Full Test'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.greenButton}
          onPress={handleTestForeground}
        >
          <Text style={styles.buttonText}>
            Test Foreground Notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.orangeButton}
          onPress={handleCheckPermissions}
        >
          <Text style={styles.buttonText}>
            Check Permissions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.purpleButton}
          onPress={handleGetToken}
        >
          <Text style={styles.buttonText}>
            Get FCM Token
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Check console logs for test results
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef3c7', // yellow-100
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcd34d', // yellow-300
  },
  title: {
    color: '#92400e', // yellow-800
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 8,
  },
  blueButton: {
    backgroundColor: '#3b82f6', // blue-500
    padding: 8,
    borderRadius: 4,
  },
  greenButton: {
    backgroundColor: '#22c55e', // green-500
    padding: 8,
    borderRadius: 4,
  },
  orangeButton: {
    backgroundColor: '#f97316', // orange-500
    padding: 8,
    borderRadius: 4,
  },
  purpleButton: {
    backgroundColor: '#a855f7', // purple-500
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  description: {
    color: '#b45309', // yellow-700
    fontSize: 12,
    marginTop: 8,
  },
});
