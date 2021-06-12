import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import t from 'tcomb-form-native';
import PropTypes from 'prop-types';

import { doLogin, resetAuth } from '../../actions/auth';

import DeviceInfo from 'react-native-device-info';
import styles from './LoginScreen.style';
import { Email, Password } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';
import images from '../../constants/images';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { ScrollView } from 'react-native-gesture-handler';

import { SIGNUP_URL } from '../../constants/url';
import CustomText from '../../components/Text';
import { openURL } from '../../helpers/UrlHelper';

const { Form } = t.form;
const LoginForm = t.struct({
  email: Email,
  password: Password,
});

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
  const inputRef = useRef(null);

  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const options = {
    fields: {
      email: {
        placeholder: '',
        template: props => <TextInputField {...props} />,
        keyboardType: 'email-address',
        error: i18n.t('LOGIN.EMAIL_ERROR'),

        autoCompleteType: false,
        autoCorrect: false,
        config: {
          label: i18n.t('LOGIN.EMAIL'),
        },
        autoCapitalize: 'none',
      },
      password: {
        placeholder: '',
        template: props => <TextInputField {...props} />,
        keyboardType: 'default',
        autoCapitalize: 'none',
        autoCompleteType: false,
        autoCorrect: false,
        error: i18n.t('LOGIN.PASSWORD_ERROR'),
        config: {
          label: i18n.t('LOGIN.PASSWORD'),
        },
        secureTextEntry: true,
      },
    },
  };

  const isLoggingIn = useSelector(state => state.auth.isLoggingIn);
  const installationUrl = useSelector(state => state.settings.installationUrl);
  const baseUrl = useSelector(state => state.settings.baseUrl);

  useEffect(() => {
    dispatch(resetAuth());
    if (!installationUrl) {
      navigation.navigate('ConfigureURL');
    }
  }, [installationUrl, navigation, dispatch]);

  const onChange = value => {
    setValues(value);
  };

  const doSignup = () => {
    openURL({ URL: `${installationUrl}${SIGNUP_URL}` });
  };

  const onPress = () => {
    const value = inputRef.current.getValue();
    if (value) {
      const { email, password } = values;
      dispatch(doLogin({ email, password }));
    }
  };

  const { navigate } = navigation;
  const { style } = eva;

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
            <Form
              ref={inputRef}
              type={LoginForm}
              options={options}
              value={values}
              onChange={value => onChange(value)}
            />
            <TouchableOpacity style={style.forgotView} onPress={() => navigate('ResetPassword')}>
              <CustomText style={style.textStyle}>{i18n.t('LOGIN.FORGOT_PASSWORD')}</CustomText>
            </TouchableOpacity>
            <View style={style.loginButtonView}>
              <LoaderButton
                style={style.loginButton}
                loading={isLoggingIn}
                textStyle={style.buttonTextStyle}
                onPress={() => onPress()}
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
                  <CustomText style={style.textStyle}>{'   |   '}</CustomText>
                </>
              )}

              <TouchableOpacity onPress={() => navigate('ConfigureURL')}>
                <CustomText style={style.textStyle}> {i18n.t('LOGIN.CHANGE_URL')}</CustomText>
              </TouchableOpacity>
            </View>
            <View style={style.accountView}>
              <TouchableOpacity onPress={() => navigate('Language')}>
                <CustomText style={style.textStyle}> {i18n.t('LOGIN.CHANGE_LANGUAGE')}</CustomText>
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
