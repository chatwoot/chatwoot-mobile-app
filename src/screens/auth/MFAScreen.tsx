import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, StatusBar, View, TextInput, Text, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button, VerificationCode } from '@/components-next';
import { Icon } from '@/components-next/common';
import { CheckedIcon, LockKeyholeIcon, UncheckedIcon } from '@/svg-icons';
import { useAnimatedShake } from '@/components-next/verification-code/hooks/use-animated-shake';
import type { StatusType } from '@/components-next/verification-code';
import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { resetSettings } from '@/store/settings/settingsSlice';
import { authActions } from '@/store/auth/authActions';
import { resetAuth, clearAuthError } from '@/store/auth/authSlice';
import { selectInstallationUrl } from '@/store/settings/settingsSelectors';
import i18n from '@/i18n';
import { showMfaSetupRequiredAlert } from './utils/mfaSetupRequiredAlert';

const MFAScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { mfaToken, verificationChannel, uiFlags, error } = useAppSelector(state => state.auth);
  const installationUrl = useAppSelector(selectInstallationUrl);

  const isEmailChannel = verificationChannel === 'email';

  const [activeTab, setActiveTab] = useState<'authenticator' | 'backup'>('authenticator');
  const [code, setCode] = useState<string[]>([]);
  const [backupCode, setBackupCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isCodeWrong, setIsCodeWrong] = useState(false);
  const [isCodeFocused, setIsCodeFocused] = useState(true);
  const hiddenInputRef = useRef<TextInput>(null);
  const backupInputRef = useRef<TextInput>(null);

  const verificationStatus = useSharedValue<StatusType>('inProgress');
  const { shake, rShakeStyle } = useAnimatedShake();

  useEffect(() => {
    dispatch(resetSettings());
  }, [dispatch]);

  // Dismissing the keyboard by tapping elsewhere leaves the code input focused, so a
  // later tap on it would not reopen the keyboard; blur it whenever the keyboard hides.
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', () => {
      hiddenInputRef.current?.blur();
      setIsCodeFocused(false);
    });
    return () => subscription.remove();
  }, []);

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

    // Email verification waits for an explicit Verify so the remember-device
    // choice below the input is part of the submission.
    if (newCode.length === 6 && !isEmailChannel) {
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
        ...(isEmailChannel ? { remember_device: rememberDevice } : {}),
      };

      const result = await dispatch(authActions.verifyMfa(payload)).unwrap();

      if ('mfa_setup_required' in result) {
        showMfaSetupRequiredAlert(installationUrl);
        navigation.goBack();
        return;
      }

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
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}
          contentContainerStyle={tailwind.style('px-6 pt-4 pb-8')}>
          <View style={tailwind.style('gap-4')}>
            <View
              style={tailwind.style(
                'self-center w-16 h-16 rounded-full border border-gray-300 items-center justify-center',
              )}>
              <Icon icon={<LockKeyholeIcon stroke={tailwind.color('text-gray-800')} />} size={24} />
            </View>
            <Animated.Text
              style={tailwind.style('text-2xl text-gray-950 font-inter-semibold-20 text-center')}>
              {isEmailChannel ? i18n.t('MFA.EMAIL.TITLE') : i18n.t('MFA.TITLE')}
            </Animated.Text>
            {isEmailChannel && (
              <Text style={tailwind.style('text-gray-700 font-inter-normal-20 text-center')}>
                {i18n.t('MFA.EMAIL.DESCRIPTION')}
              </Text>
            )}
          </View>

          {/* Tab Selector */}
          {!isEmailChannel && (
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
          )}

          {/* Code Input */}
          <View style={tailwind.style(isEmailChannel ? 'mt-14' : 'mt-4')}>
            <Text style={[tailwind.style('text-gray-950 font-inter-420-20 mb-4 pl-2')]}>
              {isEmailChannel
                ? i18n.t('MFA.EMAIL.INSTRUCTIONS')
                : activeTab === 'authenticator'
                  ? i18n.t('MFA.INSTRUCTIONS.AUTHENTICATOR')
                  : i18n.t('MFA.INSTRUCTIONS.BACKUP')}
            </Text>

            {activeTab === 'authenticator' ? (
              <>
                <Animated.View style={[rShakeStyle, tailwind.style('mb-2')]}>
                  <VerificationCode
                    code={code}
                    maxLength={6}
                    status={verificationStatus}
                    isCodeWrong={isCodeWrong}
                    focused={isCodeFocused}
                  />
                  {/* Invisible input over the boxes: tapping focuses it, long press pastes */}
                  <TextInput
                    ref={hiddenInputRef}
                    style={tailwind.style('absolute inset-0 text-transparent bg-transparent')}
                    value={code.join('')}
                    onChangeText={handleCodeChange}
                    onPressIn={() => hiddenInputRef.current?.focus()}
                    onFocus={() => setIsCodeFocused(true)}
                    onBlur={() => setIsCodeFocused(false)}
                    maxLength={6}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    caretHidden
                    textContentType="oneTimeCode"
                  />
                </Animated.View>

                {/* Error message for authenticator */}
                {error && (
                  <Animated.Text
                    style={tailwind.style('font-inter-normal-20 text-ruby-900 mb-6 pl-2')}>
                    {error}
                  </Animated.Text>
                )}

                {!error && <View style={tailwind.style('mb-8')} />}
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
                      setBackupCode(text);
                      setIsCodeWrong(false);
                      if (error) dispatch(clearAuthError());
                    }}
                    placeholder={i18n.t('MFA.PLACEHOLDERS.BACKUP_CODE')}
                    keyboardType="default"
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

            {isEmailChannel && (
              <Pressable
                onPress={() => setRememberDevice(value => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberDevice }}
                hitSlop={12}
                style={tailwind.style('flex-row items-center gap-3 mb-4 py-2 pl-2 min-h-11')}>
                <Icon icon={rememberDevice ? <CheckedIcon /> : <UncheckedIcon />} size={20} />
                <Text style={tailwind.style('flex-1 text-gray-700 font-inter-normal-20')}>
                  {i18n.t('MFA.EMAIL.REMEMBER_DEVICE')}
                </Text>
              </Pressable>
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
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              style={tailwind.style('mt-6 items-center')}>
              <Text style={tailwind.style('font-inter-normal-20 text-gray-800')}>
                {i18n.t('MFA.CANCEL')}
              </Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MFAScreen;
