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
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-gray-50')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-gray-50')}
        barStyle={'dark-content'}
      />
      <View style={tailwind.style('flex-1 bg-gray-50')}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('flex-grow justify-center px-6 py-8')}>
          <View style={tailwind.style('items-center mb-16')}>
            <AlooLogo width={200} height={36} />
          </View>
          <View style={tailwind.style('gap-3 mb-10 items-center')}>
            <Animated.Text style={tailwind.style('text-3xl text-gray-950 font-inter-semibold-20 text-center')}>
              {i18n.t('LOGIN.TITLE')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'font-inter-normal-20 text-base text-gray-600 text-center',
              )}>
              Sign in to continue to your account
            </Animated.Text>
          </View>

          {showSsoLogin && (
            <View style={tailwind.style('mb-6')}>
              <AuthButton
                text={i18n.t('LOGIN.LOGIN_VIA_SSO')}
                icon={<LockIcon />}
                handlePress={handleSsoLogin}
                disabled={isLoggingIn}
                variant="outline"
              />

              <View style={tailwind.style('flex-row items-center my-8')}>
                <View style={tailwind.style('flex-1 h-px bg-gray-300')} />
                <Animated.Text style={tailwind.style('px-4 text-sm text-gray-500 font-inter-medium-24')}>
                  OR
                </Animated.Text>
                <View style={tailwind.style('flex-1 h-px bg-gray-300')} />
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
              <View style={tailwind.style('gap-3')}>
                <Animated.Text style={tailwind.style('font-inter-medium-24 text-sm text-gray-700 ml-1')}>
                  {i18n.t('LOGIN.EMAIL')}
                </Animated.Text>
                <View style={tailwind.style('bg-white rounded-2xl border-2 border-gray-200 shadow-md')}>
                  <TextInput
                    style={[
                      tailwind.style(
                        'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                        'py-4 px-5 text-gray-950',
                        'h-16',
                      ),
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your email"
                    placeholderTextColor={tailwind.color('text-gray-400')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <Animated.Text style={tailwind.style('font-inter-normal-20 text-sm text-ruby-900 ml-1')}>
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
              <View style={tailwind.style('gap-3 mt-5')}>
                <Animated.Text style={tailwind.style('font-inter-medium-24 text-sm text-gray-700 ml-1')}>
                  {i18n.t('LOGIN.PASSWORD')}
                </Animated.Text>
                <View style={tailwind.style('bg-white rounded-2xl border-2 border-gray-200 shadow-md')}>
                  <View style={tailwind.style('relative')}>
                    <TextInput
                      style={[
                        tailwind.style(
                          'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                          'py-4 pl-5 pr-14 text-gray-950',
                          'h-16',
                        ),
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Enter your password"
                      placeholderTextColor={tailwind.color('text-gray-400')}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable
                      style={tailwind.style('absolute right-5 top-5')}
                      onPress={() => setShowPassword(!showPassword)}>
                      <Icon size={22} icon={showPassword ? <EyeIcon /> : <EyeSlash />} />
                    </Pressable>
                  </View>
                </View>
                {errors.password && (
                  <Animated.Text style={tailwind.style('text-sm text-ruby-900 ml-1')}>
                    {errors.password.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="password"
          />

          <View style={tailwind.style('flex-row justify-between items-center mt-4 mb-8')}>
            <View />
            <Pressable onPress={openResetPassword}>
              <Animated.Text style={tailwind.style('text-blue-500 font-inter-medium-24 text-sm')}>
                {i18n.t('LOGIN.FORGOT_PASSWORD')}
              </Animated.Text>
            </Pressable>
          </View>

          <Button
            text={isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
            handlePress={handleSubmit(onSubmit)}
          />

          <View style={tailwind.style('flex-row justify-center items-center gap-6 mt-8')}>
            <Pressable onPress={openConfigInstallationURL}>
              <Animated.Text style={tailwind.style('text-sm text-gray-600 font-inter-normal-20')}>
                {i18n.t('LOGIN.CHANGE_URL')}
              </Animated.Text>
            </Pressable>
            <View style={tailwind.style('w-px h-4 bg-gray-300')} />
            <Pressable onPress={() => languagesModalSheetRef.current?.present()}>
              <Animated.Text style={tailwind.style('text-sm text-gray-600 font-inter-normal-20')}>
                {i18n.t('LOGIN.CHANGE_LANGUAGE')}
              </Animated.Text>
            </Pressable>
          </View>
        </Animated.ScrollView>
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
