import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Image, Pressable, StatusBar, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EMAIL_REGEX } from '@/constants';
import { EyeIcon, EyeSlash, LockIcon } from '@/svg-icons';
import { AlooLogo } from '@/svg-icons/AlooLogo';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { resetAuth } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import { useAppDispatch, useAppSelector } from '@/hooks';

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  LanguageList,
  Button,
  Icon,
  AuthButton,
} from '@/components-next';
import {
  selectInstallationUrl,
  selectBaseUrl,
  selectLocale,
} from '@/store/settings/settingsSelectors';
import { selectIsLoggingIn } from '@/store/auth/authSelectors';
import { setLocale } from '@/store/settings/settingsSlice';
import { useRefsContext } from '@/context/RefsContext';
import { SsoUtils } from '@/utils/ssoUtils';

type FormData = {
  email: string;
  password: string;
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { languagesModalSheetRef } = useRefsContext();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const dispatch = useAppDispatch();
  const isLoggingIn = useAppSelector(selectIsLoggingIn);

  const installationUrl = useAppSelector(selectInstallationUrl);
  const baseUrl = useAppSelector(selectBaseUrl);
  const activeLocale = useAppSelector(selectLocale);

  useEffect(() => {
    languagesModalSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocale]);

  useEffect(() => {
    dispatch(resetAuth());
    if (!installationUrl) {
      navigation.navigate('ConfigureURL' as never);
    }
  }, [installationUrl, navigation, dispatch]);

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    // Clear any existing auth state before login
    dispatch(resetAuth());

    try {
      const result = await dispatch(authActions.login({ email, password })).unwrap();

      // Check if MFA is required in the response
      if ('mfa_required' in result && result.mfa_required) {
        // Navigate directly to MFA screen with the token
        navigation.navigate('MFAScreen' as never);
      }
      // If MFA not required, the auth state will be updated and
      // the app will automatically navigate to the dashboard
    } catch {
      // Login error is handled by Redux and displayed in the UI
    }
  };

  // TODO: Change this condition based on EE check
  // Show SSO login button only if installation URL contains app.AlooChat.com
  const showSsoLogin = installationUrl.includes('cx.aloochat.ai');

  const openResetPassword = () => {
    navigation.navigate('ResetPassword' as never);
  };

  const openConfigInstallationURL = () => {
    navigation.navigate('ConfigureURL' as never);
  };

  const onChangeLanguage = (locale: string) => {
    dispatch(setLocale(locale));
  };

  const handleSsoLogin = async () => {
    if (!installationUrl) {
      return;
    }

    try {
      const result = await SsoUtils.loginWithSSO(installationUrl);

      if (result.type === 'success' && result.url) {
        const ssoParams = SsoUtils.parseCallbackUrl(result.url);
        await SsoUtils.handleSsoCallback(ssoParams, dispatch);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // SSO login error handled silently
    }
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <View style={tailwind.style('flex-1 bg-white justify-between px-5 py-6')}>
        <View style={tailwind.style('flex-1 justify-center')}>
          <View style={tailwind.style('items-center mb-6')}>
            <AlooLogo width={64} height={64} />
          </View>
          <View style={tailwind.style('gap-1 mb-5 items-center')}>
            <Animated.Text style={tailwind.style('text-xl text-gray-950 font-inter-semibold-20 text-center')}>
              {i18n.t('LOGIN.TITLE')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'font-inter-normal-20 text-xs text-gray-500 text-center',
              )}>
              Sign in to continue to your account
            </Animated.Text>
          </View>

          {showSsoLogin && (
            <View style={tailwind.style('mb-5')}>
              <AuthButton
                text={i18n.t('LOGIN.LOGIN_VIA_SSO')}
                icon={<LockIcon />}
                handlePress={handleSsoLogin}
                disabled={isLoggingIn}
                variant="outline"
              />

              <View style={tailwind.style('flex-row items-center my-5')}>
                <View style={tailwind.style('flex-1 h-px bg-gray-200')} />
                <Animated.Text style={tailwind.style('px-3 text-xs text-gray-400 font-inter-medium-24')}>
                  OR
                </Animated.Text>
                <View style={tailwind.style('flex-1 h-px bg-gray-200')} />
              </View>
            </View>
          )}

          <Controller
            control={control}
            rules={{
              required: i18n.t('LOGIN.EMAIL_REQUIRED'),
              pattern: {
                value: EMAIL_REGEX,
                message: i18n.t('LOGIN.EMAIL_ERROR'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tailwind.style('gap-2')}>
                <Animated.Text style={tailwind.style('font-inter-medium-24 text-sm text-gray-700')}>
                  {i18n.t('LOGIN.EMAIL')}
                </Animated.Text>
                <View style={tailwind.style('bg-gray-50 rounded-xl border border-gray-200', errors.email && 'border-red-500')}>
                  <TextInput
                    style={[
                      tailwind.style(
                        'text-base font-inter-normal-20',
                        'py-3.5 px-4 text-gray-950',
                        'h-14',
                      ),
                    ]}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      // Instant validation feedback
                    }}
                    value={value}
                    placeholder="Enter your email"
                    placeholderTextColor={tailwind.color('text-gray-400')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                  />
                </View>
                {errors.email && (
                  <Animated.Text style={tailwind.style('font-inter-normal-20 text-xs text-red-600')}>
                    {errors.email.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="email"
          />

          <Controller
            control={control}
            rules={{
              required: i18n.t('LOGIN.PASSWORD_REQUIRED'),
              minLength: {
                value: 6,
                message: i18n.t('LOGIN.PASSWORD_ERROR'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tailwind.style('gap-2 mt-4')}>
                <Animated.Text style={tailwind.style('font-inter-medium-24 text-sm text-gray-700')}>
                  {i18n.t('LOGIN.PASSWORD')}
                </Animated.Text>
                <View style={tailwind.style('bg-gray-50 rounded-xl border border-gray-200', errors.password && 'border-red-500')}>
                  <View style={tailwind.style('relative')}>
                    <TextInput
                      style={[
                        tailwind.style(
                          'text-base font-inter-normal-20',
                          'py-3.5 pl-4 pr-12 text-gray-950',
                          'h-14',
                        ),
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Enter your password"
                      placeholderTextColor={tailwind.color('text-gray-400')}
                      secureTextEntry={!showPassword}
                      textContentType="password"
                      autoCorrect={false}
                      autoComplete="password"
                      keyboardType="default"
                      returnKeyType="done"
                    />
                    <Pressable
                      style={tailwind.style('absolute right-4 top-4')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => {
                        setShowPassword(!showPassword);
                      }}>
                      <Icon size={20} icon={showPassword ? <EyeIcon /> : <EyeSlash />} />
                    </Pressable>
                  </View>
                </View>
                {errors.password && (
                  <Animated.Text style={tailwind.style('text-xs text-red-600')}>
                    {errors.password.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="password"
          />

          <View style={tailwind.style('flex-row justify-end items-center mt-2 mb-5')}>
            <Pressable onPress={openResetPassword}>
              <Animated.Text style={tailwind.style('text-blue-600 font-inter-medium-24 text-sm')}>
                {i18n.t('LOGIN.FORGOT_PASSWORD')}
              </Animated.Text>
            </Pressable>
          </View>

          <Button
            text={isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
            handlePress={handleSubmit(onSubmit)}
            disabled={isLoggingIn}
          />
        </View>

        <View style={tailwind.style('items-center pb-2')}>
          <Pressable onPress={() => languagesModalSheetRef.current?.present()}>
            <Animated.Text style={tailwind.style('text-xs text-gray-400 font-inter-normal-20')}>
              {i18n.t('LOGIN.CHANGE_LANGUAGE')}
            </Animated.Text>
          </Pressable>
        </View>
      </View>
      <BottomSheetModal
        ref={languagesModalSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['70%']}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default LoginScreen;
