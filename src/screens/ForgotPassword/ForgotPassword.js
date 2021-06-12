import React, { useEffect, useState, useRef } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { View, SafeAreaView, Image, ScrollView } from 'react-native';
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
import images from '../../constants/images';
import CustomText from '../../components/Text';

// eslint-disable-next-line react/prop-types
const BackIcon = ({ style: { tintColor } }) => {
  return <Icon name="arrow-back-outline" color={tintColor} />;
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
        template: props => <TextInputField {...props} />,
        keyboardType: 'email-address',
        error: i18n.t('FORGOT_PASSWORD.EMAIL_ERROR'),
        autoCapitalize: 'none',
        autoCompleteType: false,
        autoCorrect: false,
        config: {
          label: i18n.t('FORGOT_PASSWORD.EMAIL'),
        },
      },
    },
  };

  const isResettingPassword = useSelector(state => state.auth.isResettingPassword);

  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const onBackPress = () => {
    navigation.goBack();
  };

  const renderLeftControl = () => <TopNavigationAction onPress={onBackPress} icon={BackIcon} />;

  const onChange = value => {
    setValues(value);
  };

  const doResetPassword = () => {
    const value = inputRef.current.getValue();
    if (value) {
      dispatch(onResetPassword(value));
    }
  };

  const { style } = eva;

  return (
    <SafeAreaView style={style.mainView}>
      <TopNavigation
        titleStyle={style.headerTitle}
        title={i18n.t('FORGOT_PASSWORD.HEADER_TITLE')}
        accessoryLeft={renderLeftControl}
      />
      <ScrollView>
        <View style={style.logoView}>
          <Image style={style.logo} source={images.forgotPassword} />
        </View>

        <View style={style.titleView}>
          <CustomText style={style.titleText}>{i18n.t('FORGOT_PASSWORD.TITLE')}</CustomText>
        </View>
        <View style={style.titleView}>
          <CustomText appearance="hint" style={style.subTitleText}>
            {i18n.t('FORGOT_PASSWORD.SUB_TITLE')}
          </CustomText>
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

            <View style={style.forgotButtonView}>
              <LoaderButton
                style={style.forgotButton}
                loading={isResettingPassword}
                onPress={() => doResetPassword()}
                size="large"
                text={i18n.t('FORGOT_PASSWORD.RESET_HERE')}
                textStyle={style.forgotButtonText}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

ForgotPasswordComponent.propTypes = propTypes;
ForgotPasswordComponent.defaultProps = defaultProps;

const ForgotPassword = withStyles(ForgotPasswordComponent, styles);
export default ForgotPassword;
