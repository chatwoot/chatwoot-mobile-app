import React, { Component } from 'react';

import { View, Image, TouchableOpacity } from 'react-native';
import { Layout, Button } from 'react-native-ui-kitten';
import t from 'tcomb-form-native';

import styles from './LoginScreen.style';
import { Email, Password } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';
import images from '../../constants/images';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';

import CustomText from '../../components/Text';

const { Form } = t.form;
const LoginForm = t.struct({
  username: Email,
  password: Password,
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
    this.setState({
      isLoggingIn: true,
    });
    setTimeout(() => {
      this.setState({
        isLoggingIn: false,
      });
    }, 2000);

    const value = this.formRef.getValue();
    if (value) {
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
              <Button textStyle={styles.textStyle} style={styles.button}>
                {i18n.t('LOGIN.FORGOT_PASSWORD')}
              </Button>
            </View>
            <View style={styles.accountView}>
              <Button textStyle={styles.textStyle} style={styles.button}>
                {i18n.t('LOGIN.CREATE_ACCOUNT')}
              </Button>
            </View>
          </View>
        </View>
      </Layout>
    );
  }
}

export default LoginScreen;
