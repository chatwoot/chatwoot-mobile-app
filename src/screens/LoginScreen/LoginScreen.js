import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import { View, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import LanguageSelector from '../Settings/components/LanguageSelector';
import { StackActions } from '@react-navigation/native';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { ACCOUNT_EVENTS } from 'constants/analyticsEvents';
import { Text } from 'components';

import DeviceInfo from 'react-native-device-info';
import createStyles from './LoginScreen.style';
import TextInput from '../../components/TextInput';
import images from '../../constants/images';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { ScrollView } from 'react-native-gesture-handler';

import { SIGNUP_URL } from '../../constants/url';
import { openURL } from '../../helpers/UrlHelper';
import { EMAIL_REGEX } from '../../helpers/formHelper';
import { actions as authActions, resetAuth, selectLoggedIn } from 'reducer/authSlice';

import {
  selectInstallationUrl,
  selectBaseUrl,
  selectLocale,
  setLocale,
} from 'reducer/settingsSlice';

const deviceHeight = Dimensions.get('window').height;

const appName = DeviceInfo.getApplicationName();

const propTypes = {
  onLogin: PropTypes.func,
  isLoggingIn: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }).isRequired,
  resetAuth: PropTypes.func,
  installationUrl: PropTypes.string,
};

const LoginScreenComponent = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const dispatch = useDispatch();
  const { isLoggingIn } = useSelector(state => state.auth);
  const isLoggedIn = useSelector(selectLoggedIn);

  const installationUrl = useSelector(selectInstallationUrl);
  const baseUrl = useSelector(selectBaseUrl);
  const activeLocale = useSelector(selectLocale);

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

  const changeLanguageModal = useRef(null);
  const changeLanguageModalModalSnapPoints = useMemo(
    () => [deviceHeight - 210, deviceHeight - 210],
    [],
  );
  const toggleChangeLanguageModal = useCallback(() => {
    changeLanguageModal.current.present() || changeLanguageModal.current?.dismiss();
  }, []);
  const closeChangeLanguageModal = useCallback(() => {
    changeLanguageModal.current?.dismiss();
  }, []);
  const onChangeLanguage = useCallback(
    locale => {
      dispatch(setLocale(locale));
      AnalyticsHelper.track(ACCOUNT_EVENTS.CHANGE_LANGUAGE, {
        language: activeLocale,
      });
      if (isLoggedIn) {
        navigation.dispatch(StackActions.replace('Tab'));
      } else {
        navigation.dispatch(StackActions.replace('Login'));
      }
      closeChangeLanguageModal();
    },
    [closeChangeLanguageModal, dispatch, activeLocale, isLoggedIn, navigation],
  );

  return (
    <SafeAreaView style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.logoView}>
          <Image style={styles.logo} source={images.login} />
        </View>
        <View style={styles.titleView}>
          <Text lg medium color={colors.textDark} style={styles.titleText}>
            {i18n.t('LOGIN.TITLE')}
          </Text>
          {baseUrl ? (
            <Text sm color={colors.textLight} style={styles.subTitleText}>
              {i18n.t('LOGIN.DESCRIPTION', { baseUrl })}
            </Text>
          ) : null}
        </View>

        <View style={styles.contentView}>
          <View style={styles.formView}>
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
              <View style={styles.spacer} />
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
            <TouchableOpacity style={styles.forgotView} onPress={() => navigate('ResetPassword')}>
              <Text xs medium color={colors.textLight}>
                {i18n.t('LOGIN.FORGOT_PASSWORD')}
              </Text>
            </TouchableOpacity>
            <View style={styles.loginButtonView}>
              <LoaderButton
                titleStyle={styles.loginButton}
                loading={isLoggingIn}
                colorScheme="primary"
                onPress={handleSubmit(onSubmit)}
                size="expanded"
                text={i18n.t('LOGIN.LOGIN')}
              />
            </View>
          </View>

          <View style={styles.linksContainer}>
            <View style={styles.accountView}>
              {appName === 'Chatwoot' && (
                <>
                  <TouchableOpacity onPress={doSignup}>
                    <Text xs medium color={colors.textLight}>
                      {i18n.t('LOGIN.CREATE_ACCOUNT')}
                    </Text>
                  </TouchableOpacity>
                  <Text color={colors.textLight}>{'   |   '}</Text>
                </>
              )}

              <TouchableOpacity onPress={() => navigate('ConfigureURL')}>
                <Text xs medium color={colors.textLight}>
                  {i18n.t('LOGIN.CHANGE_URL')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.accountView}>
              <TouchableOpacity onPress={toggleChangeLanguageModal}>
                <Text xs medium color={colors.textLight}>
                  {i18n.t('LOGIN.CHANGE_LANGUAGE')}
                </Text>
              </TouchableOpacity>
            </View>
            <BottomSheetModal
              bottomSheetModalRef={changeLanguageModal}
              initialSnapPoints={changeLanguageModalModalSnapPoints}
              showHeader
              headerTitle={i18n.t('LOGIN.CHANGE_LANGUAGE')}
              closeFilter={closeChangeLanguageModal}
              children={
                <LanguageSelector
                  activeValue={activeLocale}
                  colors={colors}
                  onPress={onChangeLanguage}
                />
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

LoginScreenComponent.propTypes = propTypes;
export default LoginScreenComponent;
