import React, { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, View, TextInput, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button, VerificationCode } from '@/components-next';
import { useAnimatedShake } from '@/components-next/verification-code/hooks/use-animated-shake';
import type { StatusType } from '@/components-next/verification-code';
import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { resetSettings } from '@/store/settings/settingsSlice';
import { authActions } from '@/store/auth/authActions';
import { resetAuth } from '@/store/auth/authSlice';

const MFAScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { mfaToken, uiFlags } = useAppSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState<'authenticator' | 'backup'>('authenticator');
  const [code, setCode] = useState<string[]>([]);
  const [backupCode, setBackupCode] = useState('');
  const [isCodeWrong, setIsCodeWrong] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);
  const backupInputRef = useRef<TextInput>(null);

  const verificationStatus = useSharedValue<StatusType>('inProgress');
  const { shake, rShakeStyle } = useAnimatedShake();

  useEffect(() => {
    dispatch(resetSettings());
  }, [dispatch]);

  // Clear MFA token when navigating away from MFA screen (back button, hardware back, etc.)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // Clear MFA token when leaving the screen
      dispatch(resetAuth());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  const handleCodeChange = (text: string) => {
    const newCode = text
      .replace(/[^0-9]/g, '')
      .split('')
      .slice(0, 6);
    setCode(newCode);
    setIsCodeWrong(false);
    verificationStatus.value = 'inProgress';

    if (newCode.length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleVerify = async (enteredCode?: string) => {
    if (!mfaToken) return;

    setIsCodeWrong(false);

    try {
      const payload = {
        mfa_token: mfaToken,
        ...(activeTab === 'authenticator'
          ? { otp_code: enteredCode || code.join('') }
          : { backup_code: backupCode }),
      };

      await dispatch(authActions.verifyMfa(payload)).unwrap();

      verificationStatus.value = 'correct';

      // The app will automatically navigate to main app when user is set in auth state
      // No manual navigation needed - the existing auth logic handles this
    } catch (error) {
      verificationStatus.value = 'wrong';
      setIsCodeWrong(true);
      shake();

      if (activeTab === 'authenticator') {
        setCode([]);
        if (hiddenInputRef.current) {
          hiddenInputRef.current.clear();
        }
      } else {
        setBackupCode('');
        if (backupInputRef.current) {
          backupInputRef.current.clear();
        }
      }
    }
  };

  const handleResendCode = () => {
    // Implement resend logic - typically would call an API to resend the code
    console.log('Resending code for activeTab:', activeTab);
  };

  const backToLogin = () => {
    dispatch(resetAuth()); // Clear MFA state
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-6 pt-8')}
          keyboardShouldPersistTaps="handled">
          <View style={tailwind.style('pt-6 gap-4')}>
            <Animated.Text
              style={tailwind.style('text-2xl text-gray-950 font-inter-semibold-20 text-center')}>
              Two-Factor Authentication
            </Animated.Text>
          </View>

          {/* Tab Selector */}
          <View style={tailwind.style('flex-row mt-8 mb-6 bg-gray-100 rounded-lg p-1')}>
            <Pressable
              style={tailwind.style(
                `flex-1 py-3 px-4 rounded-md ${activeTab === 'authenticator' ? 'bg-white' : ''}`,
              )}
              onPress={() => {
                setActiveTab('authenticator');
                setIsCodeWrong(false);
                verificationStatus.value = 'inProgress';
              }}>
              <Text
                style={tailwind.style(
                  `text-center font-inter-normal-20 ${
                    activeTab === 'authenticator' ? 'text-gray-950' : 'text-gray-600'
                  }`,
                )}>
                Authenticator App
              </Text>
            </Pressable>
            <Pressable
              style={tailwind.style(
                `flex-1 py-3 px-4 rounded-md ${activeTab === 'backup' ? 'bg-white' : ''}`,
              )}
              onPress={() => {
                setActiveTab('backup');
                setIsCodeWrong(false);
                verificationStatus.value = 'inProgress';
              }}>
              <Text
                style={tailwind.style(
                  `text-center font-inter-normal-20 ${
                    activeTab === 'backup' ? 'text-gray-950' : 'text-gray-600'
                  }`,
                )}>
                Backup Code
              </Text>
            </Pressable>
          </View>

          {/* Code Input */}
          <View style={tailwind.style('mt-4')}>
            <Text style={[tailwind.style('text-gray-700 font-inter-normal-20 mb-4 pl-2')]}>
              {activeTab === 'authenticator'
                ? 'Enter 6-digit code from your authenticator app'
                : 'Enter your one of your backup code'}
            </Text>

            {activeTab === 'authenticator' ? (
              <>
                <Pressable onPress={() => hiddenInputRef.current?.focus()}>
                  <Animated.View style={[rShakeStyle, tailwind.style('mb-8')]}>
                    <VerificationCode
                      code={code}
                      maxLength={6}
                      status={verificationStatus}
                      isCodeWrong={isCodeWrong}
                    />
                  </Animated.View>
                </Pressable>

                {/* Hidden TextInput for OTP */}
                <TextInput
                  ref={hiddenInputRef}
                  style={tailwind.style('position-absolute opacity-0 w-1 h-1')}
                  value={code.join('')}
                  onChangeText={handleCodeChange}
                  maxLength={6}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  autoFocus
                  textContentType="oneTimeCode"
                />
              </>
            ) : (
              <Animated.View style={[rShakeStyle, tailwind.style('mb-8 pl-2 pr-2')]}>
                <TextInput
                  ref={backupInputRef}
                  style={tailwind.style(
                    `w-full p-4 border-2 rounded-lg text-left  ${
                      isCodeWrong ? 'border-red-500' : 'border-gray-300'
                    }`,
                  )}
                  value={backupCode}
                  onChangeText={setBackupCode}
                  placeholder="Enter backup code"
                  autoCapitalize="characters"
                  autoFocus
                  autoCorrect={false}
                  textContentType="password"
                />
              </Animated.View>
            )}

            <Button
              text={uiFlags.isVerifyingMfa ? 'Verifying...' : 'Verify'}
              handlePress={() => handleVerify()}
              disabled={
                (activeTab === 'authenticator' && code.length !== 6) ||
                (activeTab === 'backup' && !backupCode.trim()) ||
                uiFlags.isVerifyingMfa
              }
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MFAScreen;
