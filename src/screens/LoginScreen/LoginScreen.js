import React, { Component } from 'react';

import { View, Image, TouchableOpacity } from 'react-native';
import { Layout, Text } from 'react-native-ui-kitten';
import t from 'tcomb-form-native';

import styles from './LoginScreen.style';
import { Email, PasswordFormat } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';
import images from '../../constants/images';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';

const { Form } = t.form;
const LoginForm = t.struct({
  username: Email,
  password: PasswordFormat,
});

class LoginScreen extends Component {
  state = {
    values: {
      username: '',
      password: '',
    },
    options: {
      fields: {
        username: {
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
    isLoggingIn: false,
  };

  onChange(values) {
    this.setState({
      values,
    });
  }

  doLogin() {
    // this.setState({
    //   isLoggingIn: true,
    // });
    // setTimeout(() => {
    //   this.setState({
    //     isLoggingIn: false,
    //   });
    // }, 2000);
    const value = this.formRef.getValue();
    if (value) {
      // this.props.onLogin(value);
    }
  }

  render() {
    const { options, values, isLoggingIn } = this.state;

    return (
      <Layout style={styles.mainView}>
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
            <View style={styles.forgotView}>
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.textStyle}>
                  {i18n.t('LOGIN.FORGOT_PASSWORD')}
                  <Text style={styles.resetText}>
                    {i18n.t('LOGIN.RESET_HERE')}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.loginButtonView}>
              <LoaderButton
                style={styles.loginButton}
                loading={isLoggingIn}
                placeholder={i18n.t('LOGIN.LOGIN')}
                onPress={() => this.doLogin()}
              />
            </View>
          </View>

          <View>
            <View style={styles.accountView}>
              <TouchableOpacity>
                <Text style={styles.textStyle}>
                  {i18n.t('LOGIN.NO_ACCOUNT')}

                  <Text style={styles.accountText}>
                    {' '}
                    {i18n.t('LOGIN.CREATE_ACCOUNT')}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.termsPrivacyView}>
              <TouchableOpacity>
                <Text style={styles.textStyle}> {i18n.t('LOGIN.TERMS')}</Text>
              </TouchableOpacity>
              <Text style={styles.textStyle}> | </Text>
              <TouchableOpacity onPress={this.openSettings}>
                <Text style={styles.textStyle}>
                  {' '}
                  {i18n.t('LOGIN.SETTINGS')}{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Layout>
    );
  }
}

export default LoginScreen;
