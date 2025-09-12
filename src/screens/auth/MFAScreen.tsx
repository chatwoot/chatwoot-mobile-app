import React, { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, View, TextInput, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button, VerificationCode } from '@/components-next';
import { useAnimatedShake } from '@/components-next/verification-code/hooks/use-animated-shake';
import type { StatusType } from '@/components-next/verification-code';
import { tailwind } from '@/theme';
import { useAppDispatch } from '@/hooks';
import { resetSettings } from '@/store/settings/settingsSlice';

const MFAScreen = () => {
  const navigation = useNavigation();

  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<'authenticator' | 'backup'>('authenticator');
  const [code, setCode] = useState<string[]>([]);
  const [isCodeWrong, setIsCodeWrong] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  const verificationStatus = useSharedValue<StatusType>('inProgress');
  const { shake, rShakeStyle } = useAnimatedShake();

  useEffect(() => {
    dispatch(resetSettings());
  }, [dispatch]);

  const handleCodeChange = (text: string) => {
    const newCode = text
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
      .split('')
      .slice(0, 6);
    setCode(newCode);
    setIsCodeWrong(false);
    verificationStatus.value = 'inProgress';

    if (newCode.length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleVerify = async (enteredCode: string) => {
    setIsVerifying(true);
    setIsCodeWrong(false);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, assume verification fails if code is not "123456"
      if (enteredCode !== '123456') {
        throw new Error('Invalid code');
      }

      verificationStatus.value = 'correct';
      console.log('Verification successful');
      // Navigate to next screen or perform success action

      setTimeout(() => {
        setIsVerifying(false);
        // router.replace to next screen
      }, 1000);
    } catch (error) {
      verificationStatus.value = 'wrong';
      setIsCodeWrong(true);
      shake();
      setCode([]);
      if (hiddenInputRef.current) {
        hiddenInputRef.current.clear();
      }
      setIsVerifying(false);
    }
  };

  const backToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <View style={tailwind.style('flex-1 bg-white')}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-6 pt-16')}>
          <View style={tailwind.style('pt-6 gap-4 items-center')}>
            <Animated.Text style={tailwind.style('text-2xl text-gray-950 font-inter-semibold-20')}>
              Two-Factor Authentication
            </Animated.Text>
          </View>

          {/* Tab Selector */}
          <View style={tailwind.style('flex-row mt-8 mb-6 bg-gray-100 rounded-lg p-1')}>
            <Pressable
              style={tailwind.style(
                `flex-1 py-3 px-4 rounded-md ${activeTab === 'authenticator' ? 'bg-white' : ''}`,
              )}
              onPress={() => setActiveTab('authenticator')}>
              <Text
                style={tailwind.style(
                  `text-center font-inter-normal-20 ${
                    activeTab === 'authenticator' ? 'text-gray-900' : 'text-gray-600'
                  }`,
                )}>
                Authenticator App
              </Text>
            </Pressable>
            <Pressable
              style={tailwind.style(
                `flex-1 py-3 px-4 rounded-md ${activeTab === 'backup' ? 'bg-white' : ''}`,
              )}
              onPress={() => setActiveTab('backup')}>
              <Text
                style={tailwind.style(
                  `text-center font-inter-normal-20 ${
                    activeTab === 'backup' ? 'text-gray-900' : 'text-gray-600'
                  }`,
                )}>
                Backup Code
              </Text>
            </Pressable>
          </View>

          {/* Code Input */}
          <View style={tailwind.style('mt-4')}>
            <Text style={tailwind.style('text-gray-700 font-inter-normal-20 mb-4 text-center')}>
              {activeTab === 'authenticator'
                ? 'Enter 6-digit code from your authenticator app'
                : 'Enter your backup code'}
            </Text>

            <Animated.View style={[rShakeStyle, tailwind.style('mb-8')]}>
              <VerificationCode
                code={code}
                maxLength={6}
                status={verificationStatus}
                isDarkMode={false}
                isCodeWrong={isCodeWrong}
              />
            </Animated.View>

            {/* Hidden TextInput */}
            <TextInput
              ref={hiddenInputRef}
              style={tailwind.style('position-absolute opacity-0 w-1 h-1')}
              value={code.join('')}
              onChangeText={handleCodeChange}
              maxLength={6}
              keyboardType="default"
              autoCapitalize="characters"
              autoFocus
              textContentType="oneTimeCode"
            />

            <Button
              text={isVerifying ? 'Verifying...' : 'Verify'}
              onPress={() => handleVerify(code.join(''))}
              disabled={code.length !== 6 || isVerifying}
            />
            <Pressable
              style={tailwind.style('flex-row items-center justify-center mt-6 gap-1')}
              onPress={() => backToLogin()}>
              <Text style={tailwind.style('text-gray-600 font-inter-normal-20')}>
                ← Back to Login
              </Text>
            </Pressable>
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MFAScreen;
