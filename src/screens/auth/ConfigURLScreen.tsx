import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, StatusBar, Switch, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Application from 'expo-application';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon } from '@/components-next';
import { URL_WITHOUT_HTTP_REGEX } from '@/constants';
import { LinkIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { selectBaseUrl, selectIsSettingUrl } from '@/store/settings/settingsSelectors';
import { resetSettings } from '@/store/settings/settingsSlice';
import { settingsActions } from '@/store/settings/settingsActions';
import { extractDomain } from '@/store/settings/settingsUtils';
import {
  cloudflareAccessOrigin,
  getCloudflareAccessCredentials,
  loadCloudflareAccess,
} from '@/services/cloudflareAccess';

type FormData = {
  url: string;
  clientId: string;
  clientSecret: string;
};

const appName = Application.applicationName;

const ConfigURLScreen = () => {
  const baseUrl = useAppSelector(selectBaseUrl);
  const isConnecting = useAppSelector(selectIsSettingUrl);
  const [useAccess, setUseAccess] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      url: baseUrl ? baseUrl : appName === 'Chatwoot' ? 'app.chatwoot.com' : '',
      clientId: '',
      clientSecret: '',
    },
  });

  const origin = cloudflareAccessOrigin(`https://${extractDomain({ url: watch('url') })}/`);
  const credentialOrigin = useRef(origin);

  useEffect(() => {
    // Changing servers requires explicitly configuring its own credential.
    if (credentialOrigin.current !== origin) {
      credentialOrigin.current = origin;
      setValue('clientId', '');
      setValue('clientSecret', '');
      setUseAccess(false);
    }
  }, [origin, setValue]);

  useEffect(() => {
    let active = true;
    const initialOrigin = credentialOrigin.current;
    loadCloudflareAccess()
      .then(() => {
        if (!active || !initialOrigin || credentialOrigin.current !== initialOrigin) return;
        const credentials = getCloudflareAccessCredentials(initialOrigin);
        if (credentials) {
          setValue('clientId', credentials.clientId);
          setValue('clientSecret', credentials.clientSecret);
          setUseAccess(true);
        }
      })
      .catch(() => {
        if (active) setError('root', { message: i18n.t('CONFIGURE_URL.ACCESS_STORAGE_ERROR') });
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });
    return () => {
      active = false;
    };
  }, [setError, setValue]);

  useEffect(() => {
    dispatch(resetSettings());
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    clearErrors('root');
    const { url, clientId, clientSecret } = data;
    if (url) {
      await dispatch(
        settingsActions.setInstallationUrl(url, useAccess ? { clientId, clientSecret } : null),
      );
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
          contentContainerStyle={tailwind.style('px-6 pt-16 pb-8')}>
          <Icon icon={<LinkIcon />} size={40} />
          <View style={tailwind.style('pt-6 gap-4')}>
            <Animated.Text style={tailwind.style('text-2xl text-gray-950 font-inter-semibold-20')}>
              {i18n.t('CONFIGURE_URL.ENTER_URL')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'font-inter-normal-20 leading-[18px] tracking-[0.32px] text-gray-900',
              )}>
              {i18n.t('CONFIGURE_URL.DESCRIPTION')}
            </Animated.Text>
          </View>

          <Controller
            control={control}
            rules={{
              required: i18n.t('CONFIGURE_URL.URL_REQUIRED'),
              pattern: {
                value: URL_WITHOUT_HTTP_REGEX,
                message: i18n.t('CONFIGURE_URL.URL_ERROR'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tailwind.style('pt-8 mb-8 gap-2')}>
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
                  autoCorrect={false}
                  editable={!isConnecting && !isHydrating}
                  accessibilityLabel={i18n.t('CONFIGURE_URL.ENTER_URL')}
                />
                {errors.url && (
                  <Animated.Text style={tailwind.style('text-ruby-900')}>
                    {errors.url.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="url"
          />

          <View style={tailwind.style('mb-8 gap-3')}>
            <View style={tailwind.style('flex-row items-center justify-between gap-4')}>
              <Animated.Text style={tailwind.style('font-inter-420-20 text-gray-950 flex-1')}>
                {i18n.t('CONFIGURE_URL.ACCESS_TITLE')}
              </Animated.Text>
              <Switch
                value={useAccess}
                onValueChange={setUseAccess}
                disabled={isConnecting || isHydrating}
                accessibilityLabel={i18n.t('CONFIGURE_URL.ACCESS_TITLE')}
              />
            </View>
            <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
              {i18n.t('CONFIGURE_URL.ACCESS_DESCRIPTION')}
            </Animated.Text>
            {useAccess &&
              (['clientId', 'clientSecret'] as const).map(name => {
                const label = i18n.t(
                  name === 'clientId'
                    ? 'CONFIGURE_URL.ACCESS_CLIENT_ID'
                    : 'CONFIGURE_URL.ACCESS_CLIENT_SECRET',
                );
                return (
                  <Controller
                    key={name}
                    control={control}
                    name={name}
                    rules={{
                      validate: value =>
                        !useAccess ||
                        (!!value.trim() && !/\s/.test(value.trim())) ||
                        i18n.t('CONFIGURE_URL.ACCESS_REQUIRED'),
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={tailwind.style('gap-2')}>
                        <Animated.Text style={tailwind.style('font-inter-420-20 text-gray-950')}>
                          {label}
                        </Animated.Text>
                        <TextInput
                          style={tailwind.style(
                            'text-base px-3 py-2 h-10 rounded-xl text-gray-950 bg-blackA-A4',
                          )}
                          accessibilityLabel={label}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                          autoCapitalize="none"
                          autoCorrect={false}
                          spellCheck={false}
                          autoComplete="off"
                          secureTextEntry={name === 'clientSecret'}
                          editable={!isConnecting && !isHydrating}
                        />
                        {errors[name] && (
                          <Animated.Text style={tailwind.style('text-ruby-900')}>
                            {errors[name]?.message}
                          </Animated.Text>
                        )}
                      </View>
                    )}
                  />
                );
              })}
            {errors.root?.message && (
              <Animated.Text style={tailwind.style('text-ruby-900')}>
                {errors.root.message}
              </Animated.Text>
            )}
          </View>
          <Button
            text={i18n.t(isConnecting ? 'CONFIGURE_URL.CONNECTING' : 'CONFIGURE_URL.CONNECT')}
            handlePress={handleSubmit(onSubmit)}
            disabled={isConnecting || isHydrating}
          />
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ConfigURLScreen;
