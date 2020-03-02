import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Image,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
import { Button } from 'react-native-ui-kitten';
import t from 'tcomb-form-native';
import PropTypes from 'prop-types';

import { onLogin } from '../../actions/auth';

import { setLocale } from '../../actions/locale';
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

class LoginScreen extends Component {
  static propTypes = {
    onLogin: PropTypes.func,
    isLoggingIn: PropTypes.bool,
    navigation: PropTypes.func,
  };

  static defaultProps = {
    onLogin: () => {},
    isLoggingIn: false,
  };

  state = {
    values: {
      email: '',
      password: '',
    },
    options: {
      fields: {
        email: {
          placeholder: '',
          template: TextInputField,
          keyboardType: 'email-address',
          error: i18n.t('LOGIN.EMAIL_ERROR'),
          autoCapitalize: 'none',
          config: {
            label: i18n.t('LOGIN.EMAIL'),
          },
        },
        password: {
          placeholder: '',
          template: TextInputField,
          keyboardType: 'default',
          autoCapitalize: 'none',
          error: i18n.t('LOGIN.PASSWORD_ERROR'),
          config: {
            label: i18n.t('LOGIN.PASSWORD'),
          },
          secureTextEntry: true,
        },
      },
    },
  };

  onChange(values) {
    this.setState({
      values,
    });
  }

  doLogin() {
    const value = this.formRef.getValue();

    if (value) {
      const { email, password } = value;
      this.props.onLogin({ email, password });
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    const { options, values } = this.state;
    const { isLoggingIn } = this.props;
    return (
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled>
        <ScrollView
          style={{
            height: Dimensions.get('window').height,
          }}>
          <View style={styles.logoView}>
            <Image style={styles.logo} source={images.appLogo} />
          </View>

          <View style={styles.contentView}>
            <View style={styles.formView}>
              <Form
                ref={ref => {
                  this.formRef = ref;
                }}
                type={LoginForm}
                options={options}
                value={values}
                onChange={value => this.onChange(value)}
              />
              <View style={styles.loginButtonView}>
                <LoaderButton
                  style={styles.loginButton}
                  loading={isLoggingIn}
                  onPress={() => this.doLogin()}
                  size="large"
                  textStyle={styles.loginButtonText}>
                  {i18n.t('LOGIN.LOGIN')}
                </LoaderButton>
              </View>
            </View>

            <View>
              <View style={styles.forgotView}>
                <Button
                  textStyle={styles.textStyle}
                  style={styles.button}
                  onPress={() => navigate('ResetPassword')}>
                  {i18n.t('LOGIN.FORGOT_PASSWORD')}
                </Button>
              </View>
              <View style={styles.accountView}>
                <Button
                  textStyle={styles.textStyle}
                  style={styles.button}
                  onPress={() => openURL({ URL: SIGNUP_URL })}>
                  {i18n.t('LOGIN.CREATE_ACCOUNT')}
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

function bindAction(dispatch) {
  return {
    onLogin: data => dispatch(onLogin(data)),
    setLocale: data => dispatch(setLocale(data)),
  };
}
function mapStateToProps(state) {
  return {
    isLoggingIn: state.auth.isLoggingIn,
  };
}

export default connect(mapStateToProps, bindAction)(LoginScreen);
