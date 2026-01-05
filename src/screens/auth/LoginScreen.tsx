import {
    AuthButton,
    BottomSheetBackdrop,
    BottomSheetHeader,
    Button,
    Icon,
    LanguageList
} from '@/components-next';
import { EMAIL_REGEX } from '@/constants';
import { useRefsContext } from '@/context/RefsContext';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { authActions } from '@/store/auth/authActions';
import { selectIsLoggingIn } from '@/store/auth/authSelectors';
import { resetAuth } from '@/store/auth/authSlice';
import { settingsActions } from '@/store/settings/settingsActions';
import {
    selectBaseUrl,
    selectInstallationUrl,
    selectLocale,
} from '@/store/settings/settingsSelectors';
import { setLocale } from '@/store/settings/settingsSlice';
import { EyeIcon, EyeSlash, LockIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { SsoUtils } from '@/utils/ssoUtils';
import {
    BottomSheetModal,
    BottomSheetScrollView,
    useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Image, Pressable, StatusBar, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

    try {
      // Step 0: Verify if this instance is registered in NOTCHAT backend
      console.log('[NOTCHAT] Verifying instance before login:', installationUrl);
      await dispatch(settingsActions.verifyInstance(installationUrl)).unwrap();
    } catch (verifyError: any) {
      console.error('[NOTCHAT] Instance verification failed:', verifyError);
      // O erro já deve ter sido tratado ou podemos mostrar um Toast específico aqui se necessário
      // O unwrap joga o erro direto aqui
      return; 
    }

    // Clear any existing auth state before login
    dispatch(resetAuth());

    try {
      // Step 1: Login directly to app instance
      const result = await dispatch(authActions.login({ email, password })).unwrap();

      // Step 2: Register device with NOTCHAT backend (after successful login)
      if (!('mfa_required' in result)) {
        // Get FCM token and register with backend
        try {
          await dispatch(settingsActions.registerWithBackend()).unwrap();
          console.log('[NOTCHAT] Device registered with backend successfully');
        } catch (backendError: unknown) {
          // Log error but don't block login - user can still use the app
          console.error('[NOTCHAT] Failed to register with backend:', backendError);

          const errorPayload =
            (backendError as { payload?: { isTokenError?: boolean; message?: string } })?.payload ||
            backendError;

          // Corrigir: garantir que errorMessage seja sempre string
          const errorMessage =
            typeof errorPayload === 'string'
              ? errorPayload
              : errorPayload && typeof errorPayload === 'object' && 'message' in errorPayload
                ? (errorPayload as { message?: string }).message || ''
                : String(errorPayload || '');

          // Verificar se é erro de token antes de usar .includes
          const isTokenError =
            (errorPayload &&
              typeof errorPayload === 'object' &&
              'isTokenError' in errorPayload &&
              (errorPayload as { isTokenError?: boolean }).isTokenError) ||
            (typeof errorMessage === 'string' &&
              (errorMessage.includes('Access token inválido') ||
                errorMessage.includes('token inválido') ||
                errorMessage.includes('token não autorizado') ||
                errorMessage.includes('Verifique o token no Chatwoot') ||
                errorMessage.includes('configure o token')));

          if (isTokenError) {
            // Não bloquear login - apenas logar o erro
            console.log('[NOTCHAT] Token inválido detectado após login');
          }
        }
      }

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
      <View style={tailwind.style('flex-1 bg-white')}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-6 pt-24')}
        >
          <Image
            // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
            source={require('@/assets/images/logo.png')}
            style={tailwind.style('w-87 h-10')}
            resizeMode="contain"
          />
          <View style={tailwind.style('pt-6 gap-4')}>
            <Animated.Text style={tailwind.style('text-2xl text-gray-950 font-inter-semibold-20')}>
              {i18n.t('LOGIN.TITLE')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'font-inter-normal-20 leading-[18px] tracking-[0.32px] text-gray-900',
              )}
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
                <View style={tailwind.style('flex-1 h-px bg-gray-300')} />
                <Animated.Text style={tailwind.style('px-4 text-sm text-gray-600')}>
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
              <View style={tailwind.style('pt-2 gap-2')}>
                <Animated.Text style={tailwind.style('font-inter-420-20 text-gray-950')}>
                  {i18n.t('LOGIN.EMAIL')}
                </Animated.Text>
                <TextInput
                  style={[
                    tailwind.style(
                      'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                      'py-2 px-3 rounded-xl text-gray-950 bg-blackA-A4',
                      'h-10',
                    ),
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={tailwind.color('text-gray-900')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Animated.Text style={tailwind.style('font-inter-normal-20 text-ruby-900')}>
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
                <Animated.Text style={tailwind.style('font-inter-420-20  text-gray-950')}>
                  {i18n.t('LOGIN.PASSWORD')}
                </Animated.Text>
                <View style={tailwind.style('relative')}>
                  <TextInput
                    style={[
                      tailwind.style(
                        'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                        'py-2 pl-3 pr-10 rounded-xl text-gray-950 bg-blackA-A4',
                        'h-10',
                      ),
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor={tailwind.color('text-gray-500')}
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
                  <Animated.Text style={tailwind.style('text-ruby-900')}>
                    {errors.password.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="password"
          />

          <Pressable style={tailwind.style('pt-1 mb-8')} onPress={openResetPassword}>
            <Animated.Text style={tailwind.style('text-blue-800 font-inter-medium-24 text-right')}>
              {i18n.t('LOGIN.FORGOT_PASSWORD')}
            </Animated.Text>
          </Pressable>

          <Button
            text={isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
            handlePress={handleSubmit(onSubmit)}
          />

          <Pressable
            style={tailwind.style('flex-row justify-center items-center mt-6')}
            onPress={openConfigInstallationURL}
          >
            <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
              {i18n.t('LOGIN.CHANGE_URL')}
            </Animated.Text>
          </Pressable>
          <Pressable
            style={tailwind.style('flex-row justify-center items-center mt-4')}
            onPress={() => languagesModalSheetRef.current?.present()}
          >
            <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
              {i18n.t('LOGIN.CHANGE_LANGUAGE')}
            </Animated.Text>
          </Pressable>
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
        snapPoints={['70%']}
      >
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default LoginScreen;
