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
import { resetAuth, clearAuthError } from '@/store/auth/authSlice';
import i18n from '@/i18n';

const MFAScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { mfaToken, uiFlags, error } = useAppSelector(state => state.auth);

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

  // Clear MFA token when navigating back to login
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
    if (error) dispatch(clearAuthError());
    verificationStatus.value = 'inProgress';

    if (newCode.length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleVerify = async (enteredCode?: string) => {
    if (!mfaToken) return;

    setIsCodeWrong(false);
    dispatch(clearAuthError());

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
      // eslint-disable-next-line
    } catch (e) {
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
              {i18n.t('MFA.TITLE')}
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
                dispatch(clearAuthError());
                verificationStatus.value = 'inProgress';
              }}>
              <Text
                style={tailwind.style(
                  `text-center font-inter-normal-20 ${
                    activeTab === 'authenticator' ? 'text-gray-950' : 'text-gray-600'
                  }`,
                )}>
                {i18n.t('MFA.TABS.AUTHENTICATOR_APP')}
              </Text>
            </Pressable>
            <Pressable
              style={tailwind.style(
                `flex-1 py-3 px-4 rounded-md ${activeTab === 'backup' ? 'bg-white' : ''}`,
              )}
              onPress={() => {
                setActiveTab('backup');
                setIsCodeWrong(false);
                dispatch(clearAuthError());
                verificationStatus.value = 'inProgress';
              }}>
              <Text
                style={tailwind.style(
                  `text-center font-inter-normal-20 ${
                    activeTab === 'backup' ? 'text-gray-950' : 'text-gray-600'
                  }`,
                )}>
                {i18n.t('MFA.TABS.BACKUP_CODE')}
              </Text>
            </Pressable>
          </View>

          {/* Code Input */}
          <View style={tailwind.style('mt-4')}>
            <Text style={[tailwind.style('text-gray-700 font-inter-normal-20 mb-4 pl-2')]}>
              {activeTab === 'authenticator'
                ? i18n.t('MFA.INSTRUCTIONS.AUTHENTICATOR')
                : i18n.t('MFA.INSTRUCTIONS.BACKUP')}
            </Text>

            {activeTab === 'authenticator' ? (
              <>
                <Pressable onPress={() => hiddenInputRef.current?.focus()}>
                  <Animated.View style={[rShakeStyle, tailwind.style('mb-2')]}>
                    <VerificationCode
                      code={code}
                      maxLength={6}
                      status={verificationStatus}
                      isCodeWrong={isCodeWrong}
                    />
                  </Animated.View>
                </Pressable>

                {/* Error message for authenticator */}
                {error && (
                  <Animated.Text
                    style={tailwind.style('font-inter-normal-20 text-ruby-900 mb-6 pl-2')}>
                    {error}
                  </Animated.Text>
                )}

                {!error && <View style={tailwind.style('mb-8')} />}

                {/* Hidden TextInput for OTP */}
                <TextInput
                  ref={hiddenInputRef}
                  style={tailwind.style('opacity-0 w-1 h-1')}
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
              <>
                <Animated.View style={[rShakeStyle, tailwind.style('mb-2 pl-2 pr-2')]}>
                  <TextInput
                    ref={backupInputRef}
                    style={tailwind.style(
                      'w-full p-4 border-2 rounded-lg text-left border-gray-300',
                    )}
                    value={backupCode}
                    onChangeText={text => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setBackupCode(numericText);
                      setIsCodeWrong(false);
                      if (error) dispatch(clearAuthError());
                    }}
                    placeholder={i18n.t('MFA.PLACEHOLDERS.BACKUP_CODE')}
                    keyboardType="numeric"
                    autoFocus
                    autoCorrect={false}
                    maxLength={8}
                  />
                </Animated.View>

                {/* Error message for backup code */}
                {error && (
                  <Animated.Text
                    style={tailwind.style('font-inter-normal-20 text-ruby-900 mb-6 pl-2')}>
                    {error}
                  </Animated.Text>
                )}

                {!error && <View style={tailwind.style('mb-8')} />}
              </>
            )}

            <Button
              text={
                uiFlags.isVerifyingMfa
                  ? i18n.t('MFA.BUTTONS.VERIFYING')
                  : i18n.t('MFA.BUTTONS.VERIFY')
              }
              handlePress={() => handleVerify()}
              disabled={
                (activeTab === 'authenticator' && code.length !== 6) ||
                (activeTab === 'backup' && backupCode.length !== 8) ||
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
