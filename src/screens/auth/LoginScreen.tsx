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
import { CaretRight, EyeIcon, EyeSlash, LockIcon, MoonIcon, TranslateIcon } from '@/svg-icons';
import { tailwind, useThemedStyles } from '@/theme';
import i18n from '@/i18n';
import { resetAuth } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import { useAppDispatch, useAppSelector } from '@/hooks';

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  LanguageList,
  ThemeList,
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
import { useRefsContext, useTheme } from '@/context';
import { SsoUtils } from '@/utils/ssoUtils';

type FormData = {
  email: string;
  password: string;
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const styles = useThemedStyles();
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

  const { languagesModalSheetRef, themeModalSheetRef } = useRefsContext();
  const { theme, setTheme, isDark } = useTheme();

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
    themeModalSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

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
  // Show SSO login button only if installation URL contains app.chatwoot.com
  const showSsoLogin = installationUrl.includes('app.chatwoot.com');

  const openResetPassword = () => {
    navigation.navigate('ResetPassword' as never);
  };

  const openConfigInstallationURL = () => {
    navigation.navigate('ConfigureURL' as never);
  };

  const onChangeLanguage = (locale: string) => {
    dispatch(setLocale(locale));
  };

  const onChangeTheme = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
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
    <SafeAreaView edges={['top']} style={[tailwind.style('flex-1'), styles.bgPrimary]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={styles.statusBar} />
      <View style={[tailwind.style('flex-1'), styles.bgPrimary]}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-6 pt-5')}
        >
          <Image
            // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
            source={
              isDark
                ? require('@/assets/images/logo_dark.png')
                : require('@/assets/images/logo.png')
            }
            style={tailwind.style('w-50 h-50 self-center')}
            resizeMode="contain"
          />
          <View style={tailwind.style('pt-6 gap-4')}>
            <Animated.Text
              style={[tailwind.style('text-2xl font-inter-semibold-20'), styles.textPrimary]}
            >
              {i18n.t('LOGIN.TITLE')}
            </Animated.Text>
            <Animated.Text
              style={[
                tailwind.style('font-inter-normal-20 leading-[18px] tracking-[0.32px]'),
                styles.textSecondary,
              ]}
            >
              {i18n.t('LOGIN.DESCRIPTION', { baseUrl })}
            </Animated.Text>
          </View>

          {showSsoLogin && (
            <View>
              <AuthButton
                text={i18n.t('LOGIN.LOGIN_VIA_SSO')}
                icon={<LockIcon />}
                handlePress={handleSsoLogin}
                disabled={isLoggingIn}
                variant="outline"
                style={tailwind.style('mt-8')}
              />

              <View style={tailwind.style('flex-row items-center my-6')}>
                <View style={[tailwind.style('flex-1 h-px'), styles.divider]} />
                <Animated.Text style={[tailwind.style('px-4 text-sm'), styles.textSecondary]}>
                  OR
                </Animated.Text>
                <View style={[tailwind.style('flex-1 h-px'), styles.divider]} />
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
              <View style={tailwind.style('pt-2 gap-2')}>
                <Animated.Text style={[tailwind.style('font-inter-420-20'), styles.textPrimary]}>
                  {i18n.t('LOGIN.EMAIL')}
                </Animated.Text>
                <TextInput
                  style={[
                    tailwind.style(
                      'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                      'py-2 px-3 rounded-xl h-10',
                    ),
                    styles.textTertiary,
                    styles.bgInput,
                    styles.borderStyle,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={styles.colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Animated.Text
                    style={[tailwind.style('font-inter-normal-20'), styles.stateError]}
                  >
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
              <View style={tailwind.style('pt-8 gap-2')}>
                <Animated.Text style={[tailwind.style('font-inter-420-20'), styles.textPrimary]}>
                  {i18n.t('LOGIN.PASSWORD')}
                </Animated.Text>
                <View style={tailwind.style('relative')}>
                  <TextInput
                    style={[
                      tailwind.style(
                        'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                        'py-2 pl-3 pr-10 rounded-xl h-10',
                      ),
                      styles.textTertiary,
                      styles.bgInput,
                      styles.borderStyle,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor={styles.colors.textTertiary}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable
                    style={tailwind.style('absolute right-4 top-2.5')}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon size={20} icon={showPassword ? <EyeIcon /> : <EyeSlash />} />
                  </Pressable>
                </View>
                {errors.password && (
                  <Animated.Text style={styles.stateError}>{errors.password.message}</Animated.Text>
                )}
              </View>
            )}
            name="password"
          />

          <Pressable style={tailwind.style('pt-1 mb-8')} onPress={openResetPassword}>
            <Animated.Text
              style={[tailwind.style('font-inter-medium-24 text-right'), styles.textLink]}
            >
              {i18n.t('LOGIN.FORGOT_PASSWORD')}
            </Animated.Text>
          </Pressable>

          <Button
            text={isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
            handlePress={handleSubmit(onSubmit)}
          />

          <View style={tailwind.style('mt-10')}>
            <View style={[tailwind.style('h-px'), styles.divider]} />
            <Pressable
              style={tailwind.style('flex-row justify-center items-center gap-2 py-6')}
              onPress={openConfigInstallationURL}
            >
              <Animated.Text style={[tailwind.style('text-sm'), styles.textSecondary]}>
                {i18n.t('LOGIN.CHANGE_URL')}
              </Animated.Text>
              <Icon size={16} icon={<CaretRight stroke={styles.colors.textSecondary} />} />
            </Pressable>
            <View style={tailwind.style('flex-row items-center justify-between pt-4 pb-6')}>
              <Pressable
                style={tailwind.style('flex-1 flex-row items-center justify-center gap-2')}
                onPress={() => languagesModalSheetRef.current?.present()}
              >
                <Icon size={16} icon={<TranslateIcon />} />
                <Animated.Text
                  style={[tailwind.style('text-sm text-center'), styles.textSecondary]}
                >
                  {i18n.t('LOGIN.CHANGE_LANGUAGE')}
                </Animated.Text>
              </Pressable>
              <View style={tailwind.style('px-3')}>
                <View style={[tailwind.style('h-6 w-px'), styles.divider]} />
              </View>
              <Pressable
                style={tailwind.style('flex-1 flex-row items-center justify-center gap-2')}
                onPress={() => themeModalSheetRef.current?.present()}
              >
                <Icon size={16} icon={<MoonIcon />} />
                <Animated.Text
                  style={[tailwind.style('text-sm text-center'), styles.textSecondary]}
                >
                  {i18n.t('LOGIN.CHANGE_APPEARANCE')}
                </Animated.Text>
              </Pressable>
            </View>
          </View>
        </Animated.ScrollView>
      </View>
      <BottomSheetModal
        ref={languagesModalSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style(
          'overflow-hidden',
          styles.sheetIndicator,
          'w-8 h-1 rounded-[11px]',
        )}
        detached
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        backgroundStyle={tailwind.style(styles.sheetBg)}
        snapPoints={['70%']}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          style={tailwind.style(styles.sheetBg)}
        >
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </BottomSheetScrollView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={themeModalSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style(
          'overflow-hidden',
          styles.sheetIndicator,
          'w-8 h-1 rounded-[11px]',
        )}
        detached
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        backgroundStyle={tailwind.style(styles.sheetBg)}
        snapPoints={[280]}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          style={tailwind.style(styles.sheetBg)}
        >
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_APPEARANCE')} />
          <ThemeList onChangeTheme={onChangeTheme} currentTheme={theme} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default LoginScreen;
