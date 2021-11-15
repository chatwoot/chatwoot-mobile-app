import React, { useState, useRef } from 'react';
import { withStyles } from '@ui-kitten/components';
import { View, SafeAreaView } from 'react-native';
import t from 'tcomb-form-native';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { profileUpdate } from '../../actions/auth';
import { Password } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';
import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './ChangePassword.style';

const { Form } = t.form;
const password = t.struct({
  current_password: Password,
  password: Password,
  password_confirmation: Password,
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

const ChangePasswordScreen = ({ eva: { style }, navigation }) => {
  const dispatch = useDispatch();

  const [values, setValues] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const inputRef = useRef(null);

  const onUpdate = () => {
    const value = inputRef.current.getValue();
    if (value) {
      dispatch(profileUpdate(value));
    }
  };

  const options = {
    fields: {
      current_password: {
        placeholder: '',
        template: props => <TextInputField {...props} />,
        keyboardType: 'default',
        autoCapitalize: 'none',
        autoCompleteType: false,
        autoCorrect: false,
        error: i18n.t('CHANGE_PASSWORD.PASSWORD_ERROR'),
        config: {
          label: i18n.t('CHANGE_PASSWORD.CURRENT'),
        },
        secureTextEntry: true,
      },
      password: {
        placeholder: '',
        template: props => <TextInputField {...props} />,
        keyboardType: 'default',
        autoCapitalize: 'none',
        autoCompleteType: false,
        autoCorrect: false,
        error: i18n.t('CHANGE_PASSWORD.NEW_PASSWORD'),
        config: {
          label: i18n.t('CHANGE_PASSWORD.NEW'),
        },
        secureTextEntry: true,
      },
      password_confirmation: {
        placeholder: '',
        template: props => <TextInputField {...props} />,
        keyboardType: 'default',
        autoCapitalize: 'none',
        autoCompleteType: false,
        autoCorrect: false,
        error: i18n.t('CHANGE_PASSWORD.PASSWORD_NOT_MATCH'),
        config: {
          label: i18n.t('CHANGE_PASSWORD.CONFIRM_NEW'),
        },
        secureTextEntry: true,
      },
    },
  };

  const onChange = value => {
    setValues(value);
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('SETTINGS.CHANGE_PASSWORD')} showLeftButton onBackPress={goBack} />
      <View style={style.formView}>
        <Form
          style={style.passwordForm}
          ref={inputRef}
          type={password}
          options={options}
          value={values}
          onChange={value => onChange(value)}
        />
        <View style={style.loginButtonView}>
          <LoaderButton
            style={style.loginButton}
            textStyle={style.buttonTextStyle}
            onPress={() => onUpdate()}
            size="large"
            text={i18n.t('CHANGE_PASSWORD.UPDATE')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

ChangePasswordScreen.propTypes = propTypes;
const ChangePassword = withStyles(ChangePasswordScreen, styles);
export default ChangePassword;
