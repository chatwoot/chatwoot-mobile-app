import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Image, TouchableOpacity, SafeAreaView, Text } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';

import DeviceInfo from 'react-native-device-info';
import styles from './LoginScreen.style';
import TextInput from '../../components/TextInput';
import images from '../../constants/images';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { ScrollView } from 'react-native-gesture-handler';

import { SIGNUP_URL } from '../../constants/url';
import CustomText from '../../components/Text';
import { openURL } from '../../helpers/UrlHelper';
import { EMAIL_REGEX } from '../../helpers/formHelper';
import { actions as authActions, resetAuth } from 'reducer/authSlice';

import { selectInstallationUrl, selectBaseUrl } from 'reducer/settingsSlice';

const appName = DeviceInfo.getApplicationName();

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  onLogin: PropTypes.func,
  isLoggingIn: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  resetAuth: PropTypes.func,
  installationUrl: PropTypes.string,
};

const defaultProps = {
  onLogin: () => {},
  isLoggingIn: false,
};

const LoginScreenComponent = ({ navigation, eva }) => {
  const dispatch = useDispatch();
  const { isLoggingIn } = useSelector(state => state.auth);

  const installationUrl = useSelector(selectInstallationUrl);
  const baseUrl = useSelector(selectBaseUrl);

  useEffect(() => {
    dispatch(resetAuth());
    if (!installationUrl) {
      navigation.navigate('ConfigureURL');
    }
  }, [installationUrl, navigation, dispatch]);

  const doSignup = () => {
    openURL({ URL: `${installationUrl}${SIGNUP_URL}` });
  };

  const { navigate } = navigation;
  const { style } = eva;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit = data => {
    const { email, password } = data;
    dispatch(authActions.doLogin({ email, password }));
  };

  return (
    <SafeAreaView style={style.keyboardView}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={style.logoView}>
          <Image style={style.logo} source={images.login} />
        </View>
        <View style={style.titleView}>
          <CustomText style={style.titleText}>{i18n.t('LOGIN.TITLE')}</CustomText>
          {baseUrl ? (
            <CustomText appearance="hint" style={style.subTitleText}>
              {i18n.t('LOGIN.DESCRIPTION', { baseUrl })}
            </CustomText>
          ) : null}
        </View>

        <View style={style.contentView}>
          <View style={style.formView}>
            <View>
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
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    errors={errors}
                    error={errors.email}
                    label={i18n.t('LOGIN.EMAIL')}
                    keyboardType="email-address"
                    errorMessage={i18n.t('LOGIN.EMAIL_ERROR')}
                    secureTextEntry={false}
                  />
                )}
                name="email"
              />
              <View style={style.spacer} />
              <View />
              <Controller
                control={control}
                rules={{
                  required: i18n.t('LOGIN.PASSWORD_REQUIRED'),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    errors={errors}
                    error={errors.password}
                    label={i18n.t('LOGIN.PASSWORD')}
                    keyboardType="default"
                    errorMessage={i18n.t('LOGIN.PASSWORD_ERROR')}
                    secureTextEntry={true}
                  />
                )}
                name="password"
              />
            </View>
            <TouchableOpacity style={style.forgotView} onPress={() => navigate('ResetPassword')}>
              <CustomText style={style.textStyle}>{i18n.t('LOGIN.FORGOT_PASSWORD')}</CustomText>
            </TouchableOpacity>
            <View style={style.loginButtonView}>
              <LoaderButton
                style={style.loginButton}
                loading={isLoggingIn}
                textStyle={style.buttonTextStyle}
                onPress={handleSubmit(onSubmit)}
                size="large"
                text={i18n.t('LOGIN.LOGIN')}
              />
            </View>
          </View>

          <View style={style.linksContainer}>
            <View style={style.accountView}>
              {appName === 'Chatwoot' && (
                <>
                  <TouchableOpacity onPress={doSignup}>
                    <CustomText style={style.textStyle}>
                      {i18n.t('LOGIN.CREATE_ACCOUNT')}
                    </CustomText>
                  </TouchableOpacity>
                  <Text style={style.textStyle}>{'   |   '}</Text>
                </>
              )}

              <TouchableOpacity onPress={() => navigate('ConfigureURL')}>
                <CustomText style={style.textStyle}>{i18n.t('LOGIN.CHANGE_URL')}</CustomText>
              </TouchableOpacity>
            </View>
            <View style={style.accountView}>
              <TouchableOpacity onPress={() => navigate('Language')}>
                <CustomText style={style.textStyle}>{i18n.t('LOGIN.CHANGE_LANGUAGE')}</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

LoginScreenComponent.propTypes = propTypes;
LoginScreenComponent.defaultProps = defaultProps;
const LoginScreen = withStyles(LoginScreenComponent, styles);

export default LoginScreen;
