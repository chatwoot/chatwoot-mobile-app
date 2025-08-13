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
import { EyeIcon, EyeSlash } from '@/svg-icons';
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
} from '@/components-next';
import {
  selectInstallationUrl,
  //selectBaseUrl,
  selectLocale,
} from '@/store/settings/settingsSelectors';
import { selectIsLoggingIn, selectLoggedIn } from '@/store/auth/authSelectors';
import { loadAndClearPendingLink } from '@/utils/dynamicLinkUtils';
import { navigationRef } from '@/utils/navigationUtils';
import { setLocale } from '@/store/settings/settingsSlice';
import { BuildInfo } from '@/components-next/common';
import { useRefsContext } from '@/context/RefsContext';
import { settingsActions } from '@/store/settings/settingsActions';
import appLogo from '@/assets/images/logo.png';

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
  const isLoggedIn = useAppSelector(selectLoggedIn);

  const installationUrl = useAppSelector(selectInstallationUrl);
  //const baseUrl = useAppSelector(selectBaseUrl);
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
      const envInstallationUrl = process.env.EXPO_PUBLIC_INSTALLATION_URL;
      if (envInstallationUrl) {
        // Try to auto-set from env to avoid forcing the user into the Configure URL screen
        // If verification fails, we'll fall back to the Configure URL screen
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(settingsActions.setInstallationUrl(envInstallationUrl));
      } else {
        navigation.navigate('ConfigureURL' as never);
      }
    }
  }, [installationUrl, navigation, dispatch]);

  // After login, if there is a pending deep link, navigate to it
  useEffect(() => {
    const maybeNavigatePending = async () => {
      if (!isLoggedIn) return;
      const context = await loadAndClearPendingLink();
      if (context) {
        (
          navigationRef.current as unknown as {
            navigate: (route: string, params?: Record<string, unknown>) => void;
          }
        )?.navigate('ChatScreen', {
          conversationId: context.conversationId,
          primaryActorId: context.primaryActorId,
          primaryActorType: context.primaryActorType,
          ref: context.ref,
          isConversationOpenedExternally: true,
        });
      }
    };
    maybeNavigatePending();
  }, [isLoggedIn]);

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    dispatch(authActions.login({ email, password }));
  };

  const openResetPassword = () => {
    navigation.navigate('ResetPassword' as never);
  };

  /* const openConfigInstallationURL = () => {
    navigation.navigate('ConfigureURL' as never);
  }; */

  const onChangeLanguage = (locale: string) => {
    dispatch(setLocale(locale));
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
          contentContainerStyle={tailwind.style('px-6 pt-24')}>
          <Image source={appLogo} style={tailwind.style('w-10 h-10')} resizeMode="contain" />
          {/* <View style={tailwind.style('pt-6 gap-4')}>
            <Animated.Text style={tailwind.style('text-2xl text-gray-950 font-inter-semibold-20')}>
              {i18n.t('LOGIN.TITLE')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'font-inter-normal-20 leading-[18px] tracking-[0.32px] text-gray-900',
              )}>
              {i18n.t('LOGIN.DESCRIPTION', { baseUrl })}
            </Animated.Text>
          </View> */}

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
              <View style={tailwind.style('pt-8 gap-2')}>
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
                    onPress={() => setShowPassword(!showPassword)}>
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
            <Animated.Text style={tailwind.style('text-brand-800 font-inter-medium-24 text-right')}>
              {i18n.t('LOGIN.FORGOT_PASSWORD')}
            </Animated.Text>
          </Pressable>

          <Button
            text={isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
            handlePress={handleSubmit(onSubmit)}
          />

          {/* <Pressable
            style={tailwind.style('flex-row justify-center items-center mt-6')}
            onPress={openConfigInstallationURL}>
            <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
              {i18n.t('LOGIN.CHANGE_URL')}
            </Animated.Text>
          </Pressable> */}
          <Pressable
            style={tailwind.style('flex-row justify-center items-center mt-4')}
            onPress={() => languagesModalSheetRef.current?.present()}>
            <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
              {i18n.t('LOGIN.CHANGE_LANGUAGE')}
            </Animated.Text>
          </Pressable>

          <Animated.View style={tailwind.style('items-center mt-6')}>
            <BuildInfo />
          </Animated.View>
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
