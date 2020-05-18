import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Image, KeyboardAvoidingView, Dimensions, Platform, Text } from 'react-native';
import { Button, withStyles } from '@ui-kitten/components';
import t from 'tcomb-form-native';
import PropTypes from 'prop-types';

import { doLogin, resetAuth } from '../../actions/auth';

import styles from './LoginScreen.style';
import { Email, Password } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';
import images from '../../constants/images';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { ScrollView } from 'react-native-gesture-handler';

import { openURL } from '../../helpers';
import { SIGNUP_URL } from '../../constants/url';

const { Form } = t.form;
const LoginForm = t.struct({
  email: Email,
  password: Password,
});

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
        template: (props) => <TextInputField {...props} />,
        keyboardType: 'email-address',
        error: i18n.t('LOGIN.EMAIL_ERROR'),
        autoCapitalize: 'none',
        config: {
          label: i18n.t('LOGIN.EMAIL'),
        },
      },
      password: {
        placeholder: '',
        template: (props) => <TextInputField {...props} />,
        keyboardType: 'default',
        autoCapitalize: 'none',
        error: i18n.t('LOGIN.PASSWORD_ERROR'),
        config: {
          label: i18n.t('LOGIN.PASSWORD'),
        },
        secureTextEntry: true,
      },
    },
  };

  const isLoggingIn = useSelector((state) => state.auth.isLoggingIn);
  const installationUrl = useSelector((state) => state.settings.installationUrl);

  useEffect(() => {
    dispatch(resetAuth());
    if (!installationUrl) {
      navigation.navigate('ConfigureURL');
    }
  }, [installationUrl, navigation, dispatch]);

  const onChange = (value) => {
    setValues(value);
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
    <KeyboardAvoidingView
      style={style.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled>
      <ScrollView
        style={{
          height: Dimensions.get('window').height,
        }}>
        <View style={style.logoView}>
          <Image style={style.logo} source={images.appLogo} />
        </View>

        <View style={style.contentView}>
          <View style={style.formView}>
            <Form
              ref={inputRef}
              type={LoginForm}
              options={options}
              value={values}
              onChange={(value) => onChange(value)}
            />
            <View style={style.loginButtonView}>
              <LoaderButton
                style={style.loginButton}
                loading={isLoggingIn}
                onPress={() => onPress()}
                size="large"
                text={i18n.t('LOGIN.LOGIN')}
                textStyle={style.loginButtonText}
              />
            </View>
          </View>

          <View>
            <View style={style.forgotView}>
              <Button appearance="ghost" status="basic" onPress={() => navigate('ResetPassword')}>
                {i18n.t('LOGIN.FORGOT_PASSWORD')}
              </Button>
            </View>
            <View style={style.accountView}>
              <Button
                style={style.button}
                appearance="ghost"
                status="basic"
                onPress={() => openURL({ URL: `${installationUrl}${SIGNUP_URL}` })}>
                {i18n.t('LOGIN.CREATE_ACCOUNT')}
              </Button>
              <Text>|</Text>
              <Button
                style={style.button}
                appearance="ghost"
                status="basic"
                onPress={() => navigate('ConfigureURL')}>
                {i18n.t('LOGIN.CHANGE_URL')}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

LoginScreenComponent.propTypes = propTypes;
LoginScreenComponent.defaultProps = defaultProps;
const LoginScreen = withStyles(LoginScreenComponent, styles);

export default LoginScreen;
