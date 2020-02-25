import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, SafeAreaView } from 'react-native';
import {
  TopNavigation,
  TopNavigationAction,
  Icon,
} from 'react-native-ui-kitten';
import t from 'tcomb-form-native';
import PropTypes from 'prop-types';

import { onResetPassword, resetAuth } from '../../actions/auth';

import { setLocale } from '../../actions/locale';
import styles from './ForgotPassword.style';
import { Email } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
const BackIcon = style => <Icon {...style} name="arrow-ios-back-outline" />;
const BackAction = props => <TopNavigationAction {...props} icon={BackIcon} />;
const { Form } = t.form;
const LoginForm = t.struct({
  email: Email,
});

class ForgotPassword extends Component {
  static propTypes = {
    onResetPassword: PropTypes.func,
    isLoading: PropTypes.bool,
    navigation: PropTypes.func,
    resetAuth: PropTypes.func,
  };

  static defaultProps = {
    doResetPassword: () => {},
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
          error: i18n.t('FORGOT_PASSWORD.EMAIL_ERROR'),
          autoCapitalize: 'none',
          config: {
            label: i18n.t('FORGOT_PASSWORD.EMAIL'),
          },
        },
      },
    },
  };

  componentDidMount() {
    this.props.resetAuth();
  }

  onBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  renderLeftControl = () => <BackAction onPress={this.onBackPress} />;

  onChange(values) {
    this.setState({
      values,
    });
  }

  doResetPassword() {
    const value = this.formRef.getValue();
    if (value) {
      this.props.onResetPassword(value);
    }
  }

  render() {
    const { options, values } = this.state;
    const { isLoading } = this.props;
    return (
      <SafeAreaView style={styles.mainView}>
        <TopNavigation
          titleStyle={styles.headerTitle}
          title={i18n.t('FORGOT_PASSWORD.HEADER_TITLE')}
          leftControl={this.renderLeftControl()}
        />
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
                onPress={() => this.doResetPassword()}
                size="large"
                textStyle={styles.loginButtonText}>
                {i18n.t('FORGOT_PASSWORD.RESET_HERE')}
              </LoaderButton>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    resetAuth: () => dispatch(resetAuth()),
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
