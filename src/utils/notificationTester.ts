import { Platform, Alert } from 'react-native';
import {
  requestNotificationPermission,
  getFCMToken,
  displayNotification,
  createNotificationChannels,
  isMessagingAvailable,
  isNotifeeAvailable,
  CHANNEL_ID,
} from '@/services/NotificationService';
import { showToast } from '@/utils/toastUtils';

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  timestamp: Date;
  details?: any;
}

class NotificationTester {
  private results: TestResult[] = [];

  private log(testName: string, passed: boolean, message: string, details?: any) {
    const result: TestResult = {
      testName,
      passed,
      message,
      timestamp: new Date(),
      details,
    };
    this.results.push(result);
    console.log(`[${testName}] ${passed ? '✅ PASS' : '❌ FAIL'}: ${message}`, details || '');
  }

  // Test 1: Check if notification services are available
  async testServiceAvailability(): Promise<void> {
    console.log('🔍 Testing notification service availability...');
    
    this.log(
      'Firebase Messaging Available',
      isMessagingAvailable,
      isMessagingAvailable ? 'Firebase messaging is available' : 'Firebase messaging is NOT available'
    );

    this.log(
      'Notifee Available',
      isNotifeeAvailable,
      isNotifeeAvailable ? 'Notifee is available' : 'Notifee is NOT available'
    );

    const overallPass = isMessagingAvailable && isNotifeeAvailable;
    this.log(
      'Overall Service Availability',
      overallPass,
      overallPass ? 'All notification services are available' : 'Some notification services are missing'
    );
  }

  // Test 2: Test notification permission flow
  async testPermissionFlow(): Promise<void> {
    console.log('🔐 Testing notification permission flow...');
    
    try {
      const hasPermission = await requestNotificationPermission();
      
      this.log(
        'Permission Request',
        hasPermission,
        hasPermission ? 'Notification permission granted' : 'Notification permission denied'
      );
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Notification permission is required for testing. Please enable it in settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      this.log(
        'Permission Request',
        false,
        'Failed to request permission',
        { error: error.message }
      );
    }
  }

  // Test 3: Test FCM token generation
  async testFCMToken(): Promise<string | null> {
    console.log('🎫 Testing FCM token generation...');
    
    try {
      const token = await getFCMToken();
      
      this.log(
        'FCM Token Generation',
        !!token,
        token ? 'FCM token generated successfully' : 'Failed to generate FCM token',
        { tokenLength: token?.length || 0 }
      );
      
      return token;
    } catch (error) {
      this.log(
        'FCM Token Generation',
        false,
        'Error generating FCM token',
        { error: error.message }
      );
      return null;
    }
  }

  // Test 4: Test notification channels (Android)
  async testNotificationChannels(): Promise<void> {
    console.log('📱 Testing notification channels...');
    
    if (Platform.OS !== 'android') {
      this.log(
        'Notification Channels',
        true,
        'Skipped - iOS does not use notification channels'
      );
      return;
    }

    try {
      await createNotificationChannels();
      this.log(
        'Notification Channels',
        true,
        'Notification channels created successfully'
      );
    } catch (error) {
      this.log(
        'Notification Channels',
        false,
        'Failed to create notification channels',
        { error: error.message }
      );
    }
  }

  // Test 5: Test local notification display
  async testLocalNotification(): Promise<void> {
    console.log('🔔 Testing local notification display...');
    
    try {
      await displayNotification({
        title: 'AlooChat Test',
        body: 'This is a test notification from AlooChat',
        data: {
          testId: 'local-test-' + Date.now(),
          type: 'test',
        },
      });
      
      this.log(
        'Local Notification Display',
        true,
        'Local notification displayed successfully'
      );
      
      showToast({ message: 'Test notification sent!' });
    } catch (error) {
      this.log(
        'Local Notification Display',
        false,
        'Failed to display local notification',
        { error: error.message }
      );
    }
  }

  // Test 6: Test different notification types
  async testNotificationTypes(): Promise<void> {
    console.log('📨 Testing different notification types...');
    
    const notificationTypes = [
      {
        name: 'Message Notification',
        title: 'John Doe',
        body: 'Hey! How are you doing?',
        channelId: CHANNEL_ID.MESSAGES,
        data: { conversationId: '123', type: 'message' },
      },
      {
        name: 'Mention Notification',
        title: 'You were mentioned',
        body: '@user mentioned you in Team Chat',
        channelId: CHANNEL_ID.MESSAGES,
        data: { conversationId: '456', type: 'mention' },
      },
      {
        name: 'Assignment Notification',
        title: 'New Conversation Assigned',
        body: 'You have been assigned a new conversation',
        channelId: CHANNEL_ID.DEFAULT,
        data: { conversationId: '789', type: 'assignment' },
      },
    ];

    for (const notif of notificationTypes) {
      try {
        await displayNotification({
          title: notif.title,
          body: notif.body,
          data: notif.data,
          channelId: notif.channelId,
        });
        
        this.log(
          notif.name,
          true,
          `${notif.name} displayed successfully`
        );
        
        // Add delay between notifications
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.log(
          notif.name,
          false,
          `Failed to display ${notif.name}`,
          { error: error.message }
        );
      }
    }
  }

  // Test 7: Test notification with rich content
  async testRichNotification(): Promise<void> {
    console.log('💎 Testing rich notification content...');
    
    try {
      await displayNotification({
        title: '🎉 Sarah Connor',
        body: 'Shared a photo with you 📸\nCheck it out!',
        data: {
          conversationId: '999',
          type: 'media',
          mediaType: 'image',
          hasAttachment: true,
        },
        channelId: CHANNEL_ID.MESSAGES,
      });
      
      this.log(
        'Rich Notification',
        true,
        'Rich notification with emojis and media indicators displayed successfully'
      );
    } catch (error) {
      this.log(
        'Rich Notification',
        false,
        'Failed to display rich notification',
        { error: error.message }
      );
    }
  }

  // Test 8: Performance test with multiple notifications
  async testNotificationBurst(): Promise<void> {
    console.log('🚀 Testing notification burst performance...');
    
    const startTime = Date.now();
    const burstCount = 5;
    let successCount = 0;
    
    try {
      const promises = Array.from({ length: burstCount }, (_, index) =>
        displayNotification({
          title: `Burst Test ${index + 1}`,
          body: `This is notification ${index + 1} of ${burstCount}`,
          data: {
            burstIndex: index + 1,
            testId: 'burst-test-' + Date.now(),
          },
        }).then(() => {
          successCount++;
        }).catch((error) => {
          console.error(`Burst notification ${index + 1} failed:`, error);
        })
      );
      
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.log(
        'Notification Burst',
        successCount === burstCount,
        `${successCount}/${burstCount} notifications sent in ${duration}ms`,
        { successCount, totalCount: burstCount, duration }
      );
    } catch (error) {
      this.log(
        'Notification Burst',
        false,
        'Burst notification test failed',
        { error: error.message }
      );
    }
  }

  // Get test results summary
  getTestSummary(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
    results: TestResult[];
  } {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    return {
      totalTests,
      passedTests,
      failedTests,
      passRate,
      results: this.results,
    };
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting comprehensive notification testing...');
    this.results = []; // Reset results
    
    await this.testServiceAvailability();
    await this.testPermissionFlow();
    await this.testFCMToken();
    await this.testNotificationChannels();
    await this.testLocalNotification();
    await this.testNotificationTypes();
    await this.testRichNotification();
    await this.testNotificationBurst();
    
    // Print summary
    const summary = this.getTestSummary();
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Pass Rate: ${summary.passRate.toFixed(1)}%`);
    
    // Show results toast
    showToast({
      message: `Tests completed: ${summary.passedTests}/${summary.totalTests} passed (${summary.passRate.toFixed(1)}%)`,
    });
    
    // Show detailed results if any failures
    if (summary.failedTests > 0) {
      const failedTests = summary.results.filter(r => !r.passed);
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`- ${test.testName}: ${test.message}`);
      });
      
      Alert.alert(
        'Test Results',
        `${summary.failedTests} tests failed. Check console for details.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'All Tests Passed! 🎉',
        'Your push notification system is working perfectly!',
        [{ text: 'Great!' }]
      );
    }
  }
}

// Export singleton instance
export const notificationTester = new NotificationTester();

// Export individual test functions for manual testing
export const {
  testServiceAvailability,
  testPermissionFlow,
  testFCMToken,
  testNotificationChannels,
  testLocalNotification,
  testNotificationTypes,
  testRichNotification,
  testNotificationBurst,
  runAllTests,
  getTestSummary,
} = notificationTester;
