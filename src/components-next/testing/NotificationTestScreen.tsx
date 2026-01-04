import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { tailwind } from '@/theme';
import { notificationTester } from '@/utils/notificationTester';
import { showToast } from '@/utils/toastUtils';
import { useTheme } from '@/context/ThemeContext';

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  timestamp: Date;
  details?: any;
}

export const NotificationTestScreen = () => {
  const { colors } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const runSingleTest = async (testName: string, testFunction: () => Promise<void>) => {
    setIsRunning(true);
    try {
      await testFunction();
      const newSummary = notificationTester.getTestSummary();
      setSummary(newSummary);
      setResults([...newSummary.results]);
      showToast({ message: `${testName} completed` });
    } catch (error) {
      Alert.alert('Test Error', `Failed to run ${testName}: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      await notificationTester.runAllTests();
      const newSummary = notificationTester.getTestSummary();
      setSummary(newSummary);
      setResults([...newSummary.results]);
    } catch (error) {
      Alert.alert('Test Error', `Failed to run all tests: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setSummary(null);
    showToast({ message: 'Results cleared' });
  };

  const TestButton = ({ title, onPress, disabled = false }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isRunning}
      style={[
        tailwind.style(
          'bg-blue-600 px-4 py-3 rounded-lg mb-2',
          (disabled || isRunning) && 'opacity-50'
        ),
        { backgroundColor: disabled || isRunning ? colors.surfaceDisabled : colors.primary }
      ]}>
      <Text style={[tailwind.style('text-white text-center font-medium'), { color: colors.primaryText }]}>
        {isRunning ? 'Running...' : title}
      </Text>
    </TouchableOpacity>
  );

  const ResultItem = ({ result }: { result: TestResult }) => (
    <View style={[
      tailwind.style('p-3 mb-2 rounded-lg border'),
      {
        backgroundColor: result.passed ? colors.successBackground : colors.errorBackground,
        borderColor: result.passed ? colors.success : colors.error,
      }
    ]}>
      <View style={tailwind.style('flex-row items-center justify-between mb-1')}>
        <Text style={[
          tailwind.style('font-medium flex-1'),
          { color: result.passed ? colors.success : colors.error }
        ]}>
          {result.passed ? '✅' : '❌'} {result.testName}
        </Text>
        <Text style={[tailwind.style('text-xs'), { color: colors.textSecondary }]}>
          {result.timestamp.toLocaleTimeString()}
        </Text>
      </View>
      <Text style={[tailwind.style('text-sm'), { color: colors.text }]}>
        {result.message}
      </Text>
      {result.details && (
        <Text style={[tailwind.style('text-xs mt-1 opacity-75'), { color: colors.textSecondary }]}>
          {JSON.stringify(result.details, null, 2)}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView style={tailwind.style('flex-1 p-4')} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tailwind.style('mb-6')}>
          <Text style={[
            tailwind.style('text-2xl font-bold mb-2'),
            { color: colors.text }
          ]}>
            🔔 Push Notification Testing
          </Text>
          <Text style={[
            tailwind.style('text-base opacity-75'),
            { color: colors.textSecondary }
          ]}>
            WhatsApp-level quality testing for AlooChat notifications
          </Text>
        </View>

        {/* Test Controls */}
        <View style={tailwind.style('mb-6')}>
          <Text style={[
            tailwind.style('text-lg font-semibold mb-3'),
            { color: colors.text }
          ]}>
            Test Controls
          </Text>
          
          <TestButton
            title="🚀 Run All Tests"
            onPress={runAllTests}
          />
          
          <View style={tailwind.style('mt-4')}>
            <Text style={[
              tailwind.style('text-base font-medium mb-2'),
              { color: colors.text }
            ]}>
              Individual Tests:
            </Text>
            
            <TestButton
              title="🔍 Service Availability"
              onPress={() => runSingleTest('Service Availability', notificationTester.testServiceAvailability)}
            />
            
            <TestButton
              title="🔐 Permission Flow"
              onPress={() => runSingleTest('Permission Flow', notificationTester.testPermissionFlow)}
            />
            
            <TestButton
              title="🎫 FCM Token"
              onPress={() => runSingleTest('FCM Token', notificationTester.testFCMToken)}
            />
            
            <TestButton
              title="📱 Notification Channels"
              onPress={() => runSingleTest('Notification Channels', notificationTester.testNotificationChannels)}
            />
            
            <TestButton
              title="🔔 Local Notification"
              onPress={() => runSingleTest('Local Notification', notificationTester.testLocalNotification)}
            />
            
            <TestButton
              title="📨 Notification Types"
              onPress={() => runSingleTest('Notification Types', notificationTester.testNotificationTypes)}
            />
            
            <TestButton
              title="💎 Rich Notifications"
              onPress={() => runSingleTest('Rich Notifications', notificationTester.testRichNotification)}
            />
            
            <TestButton
              title="🚀 Burst Test"
              onPress={() => runSingleTest('Burst Test', notificationTester.testNotificationBurst)}
            />
          </View>
        </View>

        {/* Test Summary */}
        {summary && (
          <View style={tailwind.style('mb-6')}>
            <View style={tailwind.style('flex-row items-center justify-between mb-3')}>
              <Text style={[
                tailwind.style('text-lg font-semibold'),
                { color: colors.text }
              ]}>
                📊 Test Summary
              </Text>
              <TouchableOpacity
                onPress={clearResults}
                style={[
                  tailwind.style('px-3 py-1 rounded'),
                  { backgroundColor: colors.surfaceSecondary }
                ]}>
                <Text style={[tailwind.style('text-sm'), { color: colors.textSecondary }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[
              tailwind.style('p-4 rounded-lg'),
              { backgroundColor: colors.surface }
            ]}>
              <View style={tailwind.style('flex-row justify-between mb-2')}>
                <Text style={[tailwind.style('font-medium'), { color: colors.text }]}>
                  Total Tests:
                </Text>
                <Text style={[tailwind.style('font-bold'), { color: colors.text }]}>
                  {summary.totalTests}
                </Text>
              </View>
              
              <View style={tailwind.style('flex-row justify-between mb-2')}>
                <Text style={[tailwind.style('font-medium'), { color: colors.success }]}>
                  Passed:
                </Text>
                <Text style={[tailwind.style('font-bold'), { color: colors.success }]}>
                  {summary.passedTests}
                </Text>
              </View>
              
              <View style={tailwind.style('flex-row justify-between mb-2')}>
                <Text style={[tailwind.style('font-medium'), { color: colors.error }]}>
                  Failed:
                </Text>
                <Text style={[tailwind.style('font-bold'), { color: colors.error }]}>
                  {summary.failedTests}
                </Text>
              </View>
              
              <View style={tailwind.style('flex-row justify-between')}>
                <Text style={[tailwind.style('font-medium'), { color: colors.text }]}>
                  Pass Rate:
                </Text>
                <Text style={[
                  tailwind.style('font-bold'),
                  { color: summary.passRate >= 90 ? colors.success : summary.passRate >= 70 ? colors.warning : colors.error }
                ]}>
                  {summary.passRate.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <View style={tailwind.style('mb-6')}>
            <Text style={[
              tailwind.style('text-lg font-semibold mb-3'),
              { color: colors.text }
            ]}>
              📋 Test Results
            </Text>
            
            {results.map((result, index) => (
              <ResultItem key={index} result={result} />
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={tailwind.style('mb-6')}>
          <Text style={[
            tailwind.style('text-lg font-semibold mb-3'),
            { color: colors.text }
          ]}>
            📖 Instructions
          </Text>
          
          <View style={[
            tailwind.style('p-4 rounded-lg'),
            { backgroundColor: colors.surface }
          ]}>
            <Text style={[tailwind.style('text-sm leading-6'), { color: colors.text }]}>
              1. <Text style={tailwind.style('font-semibold')}>Run All Tests</Text> for comprehensive testing{'\n'}
              2. <Text style={tailwind.style('font-semibold')}>Check permissions</Text> in device settings if tests fail{'\n'}
              3. <Text style={tailwind.style('font-semibold')}>Test background delivery</Text> by putting app in background{'\n'}
              4. <Text style={tailwind.style('font-semibold')}>Verify notification interactions</Text> by tapping notifications{'\n'}
              5. <Text style={tailwind.style('font-semibold')}>Monitor console logs</Text> for detailed error messages
            </Text>
          </View>
        </View>

        <View style={tailwind.style('h-20')} />
      </ScrollView>
    </View>
  );
};
