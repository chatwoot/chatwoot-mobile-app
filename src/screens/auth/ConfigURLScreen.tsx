import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, SafeAreaView, TextInput, View } from 'react-native';
import * as Application from 'expo-application';

import { PrimaryButton, Icon } from '@/components-next';
import { URL_WITHOUT_HTTP_REGEX } from '@/constants';
import { LinkIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { selectBaseUrl } from '@/store/settings/settingsSelectors';
import { resetSettings } from '@/store/settings/settingsSlice';
import { settingsActions } from '@/store/settings/settingsActions';

type FormData = {
  url: string;
};

const appName = Application.applicationName;

const ConfigURLScreen = () => {
  const baseUrl = useAppSelector(selectBaseUrl);

  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      url: baseUrl ? baseUrl : appName === 'Chatwoot' ? 'app.chatwoot.com' : '',
    },
  });

  useEffect(() => {
    dispatch(resetSettings());
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    const { url } = data;
    if (url) {
      dispatch(settingsActions.setInstallationUrl(url));
    }
  };

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <View style={tailwind.style('flex-1 bg-white')}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-6 pt-16')}>
          <View style={tailwind.style('mb-8')}>
            <Icon icon={<LinkIcon />} size={40} />
          </View>
          <View style={tailwind.style('mb-8')}>
            <Animated.Text style={tailwind.style('text-2xl text-gray-950 font-semibold ')}>
              {i18n.t('CONFIGURE_URL.ENTER_URL')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'font-inter-normal-20 leading-[18px] tracking-[0.32px] text-gray-900 pt-4',
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
              <View style={tailwind.style('mt-8 mb-8')}>
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
                {errors.url && (
                  <Animated.Text style={tailwind.style('text-red-700 mt-1')}>
                    {errors.url.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="url"
          />

          <PrimaryButton
            text={i18n.t('CONFIGURE_URL.CONNECT')}
            handlePress={handleSubmit(onSubmit)}
          />
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ConfigURLScreen;
