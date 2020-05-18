import React, { useEffect, useState, useRef } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { View, SafeAreaView } from 'react-native';
import { TopNavigation, TopNavigationAction, withStyles } from '@ui-kitten/components';
import t from 'tcomb-form-native';
import PropTypes from 'prop-types';

import { onResetPassword, resetAuth } from '../../actions/auth';

import styles from './ForgotPassword.style';
import { Email } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import Icon from '../../components/Icon';

// eslint-disable-next-line react/prop-types
const BackIcon = ({ style: { tintColor } }) => {
  return <Icon name="arrow-ios-back-outline" color={tintColor} />;
};

const { Form } = t.form;
const LoginForm = t.struct({
  email: Email,
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  onResetPassword: PropTypes.func,
  isLoading: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  resetAuth: PropTypes.func,
};

const defaultProps = {
  doResetPassword: () => {},
  isLoading: false,
};

const ForgotPasswordComponent = ({ eva, navigation }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const [values, setValues] = useState({ email: '' });

  const options = {
    fields: {
      email: {
        placeholder: '',
        template: (props) => <TextInputField {...props} />,
        keyboardType: 'email-address',
        error: i18n.t('FORGOT_PASSWORD.EMAIL_ERROR'),
        autoCapitalize: 'none',
        config: {
          label: i18n.t('FORGOT_PASSWORD.EMAIL'),
        },
      },
    },
  };

  const isResettingPassword = useSelector((state) => state.auth.isResettingPassword);

  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const onBackPress = () => {
    navigation.goBack();
  };

  const renderLeftControl = () => <TopNavigationAction onPress={onBackPress} icon={BackIcon} />;

  const onChange = (value) => {
    setValues(value);
  };

  const doResetPassword = () => {
    const value = inputRef.current.getValue();
    if (value) {
      dispatch(onResetPassword(value));
    }
  };

  const { style: themedStyle } = eva;

  return (
    <SafeAreaView style={themedStyle.mainView}>
      <TopNavigation
        titleStyle={themedStyle.headerTitle}
        title={i18n.t('FORGOT_PASSWORD.HEADER_TITLE')}
        accessoryLeft={renderLeftControl}
      />
      <View style={themedStyle.contentView}>
        <View style={themedStyle.formView}>
          <Form
            ref={inputRef}
            type={LoginForm}
            options={options}
            value={values}
            onChange={(value) => onChange(value)}
          />

          <View style={themedStyle.loginButtonView}>
            <LoaderButton
              style={themedStyle.loginButton}
              loading={isResettingPassword}
              onPress={() => doResetPassword()}
              size="large"
              text={i18n.t('FORGOT_PASSWORD.RESET_HERE')}
              textStyle={themedStyle.loginButtonText}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

ForgotPasswordComponent.propTypes = propTypes;
ForgotPasswordComponent.defaultProps = defaultProps;

const ForgotPassword = withStyles(ForgotPasswordComponent, styles);
export default ForgotPassword;
