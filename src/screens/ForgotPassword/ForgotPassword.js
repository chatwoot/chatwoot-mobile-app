import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Image } from 'react-native';
import { Layout, Button } from 'react-native-ui-kitten';
import t from 'tcomb-form-native';
import PropTypes from 'prop-types';

import { onResetPassword } from '../../actions/auth';

import { setLocale } from '../../actions/locale';
import styles from './ForgotPassword.style';
import { Email } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';
import images from '../../constants/images';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';

const { Form } = t.form;
const LoginForm = t.struct({
  email: Email,
});

class ForgotPassword extends Component {
  static propTypes = {
    onResetPassword: PropTypes.func,
    isLoading: PropTypes.bool,
    navigation: PropTypes.object,
  };

  static defaultProps = {
    onLogin: () => {},
    isLoading: false,
  };

  state = {
    values: {
      email: '',
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
      this.props.onResetPassword({});
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    const { options, values } = this.state;
    const { isLoading } = this.props;
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
                loading={isLoading}
                onPress={() => this.doLogin()}
                size="large"
                textStyle={styles.loginButtonText}>
                {i18n.t('FORGOT_PASSWORD.RESET_HERE')}
              </LoaderButton>
            </View>
          </View>

          <View>
            <View style={styles.forgotView}>
              <Button
                textStyle={styles.textStyle}
                style={styles.button}
                onPress={() => navigate('Login')}>
                {i18n.t('FORGOT_PASSWORD.LOGIN')}
              </Button>
            </View>
            <View style={styles.accountView}>
              <Button
                textStyle={styles.textStyle}
                style={styles.button}
                onPress={() => navigate('Login')}>
                {i18n.t('FORGOT_PASSWORD.CREATE_ACCOUNT')}
              </Button>
            </View>
          </View>
        </View>
      </Layout>
    );
  }
}

function bindAction(dispatch) {
  return {
    onResetPassword: data => dispatch(onResetPassword(data)),
    setLocale: data => dispatch(setLocale(data)),
  };
}
function mapStateToProps(state) {
  return {
    isLoading: state.auth.isResettingPassword,
  };
}

export default connect(mapStateToProps, bindAction)(ForgotPassword);
