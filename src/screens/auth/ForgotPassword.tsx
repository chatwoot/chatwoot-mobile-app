import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, SafeAreaView, TextInput, View } from 'react-native';

import { PrimaryButton, Icon } from '@/components-next';
import { EMAIL_REGEX } from '@/constants';
import { KeyRoundIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { authActions } from '@/store/auth/authActions';
import { useAppDispatch } from '@/hooks';
import { resetAuth } from '@/store/auth/authSlice';
import AnalyticsHelper from '@/helpers/AnalyticsHelper';
import { ACCOUNT_EVENTS } from '@/constants/analyticsEvents';
import i18n from '@/i18n';

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const { email } = data;
    dispatch(authActions.resetPassword({ email }));
    AnalyticsHelper.track(ACCOUNT_EVENTS.FORGOT_PASSWORD);
  };

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <View style={tailwind.style('flex-1 bg-white')}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-6 pt-16')}>
          <View style={tailwind.style('mb-8')}>
            <Icon icon={<KeyRoundIcon />} size={40} />
          </View>
          <View style={tailwind.style('mb-8')}>
            <Animated.Text style={tailwind.style('text-2xl text-gray-950 font-semibold ')}>
              {i18n.t('FORGOT_PASSWORD.TITLE')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'text-sm font-inter-medium-24 leading-[17px] tracking-[0.32px] text-gray-900 pt-4',
              )}>
              {i18n.t('FORGOT_PASSWORD.SUB_TITLE')}
            </Animated.Text>
          </View>

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
              <View style={tailwind.style('mt-8 mb-8')}>
                <Animated.Text
                  style={tailwind.style('text-sm font-inter-medium-24 mb-2 text-gray-950')}>
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
                  <Animated.Text style={tailwind.style('text-red-700 mt-1')}>
                    {errors.email.message}
                  </Animated.Text>
                )}
              </View>
            )}
            name="email"
          />

          <PrimaryButton text="Reset password" handlePress={handleSubmit(onSubmit)} />
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;
