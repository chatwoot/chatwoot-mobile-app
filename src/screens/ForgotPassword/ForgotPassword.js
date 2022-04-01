import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { View, SafeAreaView, Image, ScrollView } from 'react-native';
import { TopNavigation, TopNavigationAction, withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';

import { onResetPassword, resetAuth } from '../../actions/auth';

import styles from './ForgotPassword.style';
import TextInput from '../../components/TextInput';
import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import Icon from '../../components/Icon';
import images from '../../constants/images';
import CustomText from '../../components/Text';
import { EMAIL_REGEX } from '../../helpers/formHelper';

// eslint-disable-next-line react/prop-types
const BackIcon = ({ style: { tintColor } }) => {
  return <Icon name="arrow-back-outline" color={tintColor} />;
};

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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });
  const onSubmit = data => {
    const { email } = data;
    dispatch(onResetPassword(email));
  };

  const isResettingPassword = useSelector(state => state.auth.isResettingPassword);

  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const onBackPress = () => {
    navigation.goBack();
  };

  const renderLeftControl = () => <TopNavigationAction onPress={onBackPress} icon={BackIcon} />;

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
            <Controller
              control={control}
              rules={{
                required: i18n.t('LOGIN.EMAIL_REQUIRED'),
                pattern: {
                  value: EMAIL_REGEX,
                  message: i18n.t('LOGIN.EMAIL_ERROR'),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errors={errors}
                  error={errors.email}
                  label={i18n.t('LOGIN.EMAIL')}
                  keyboardType="email-address"
                  errorMessage={i18n.t('LOGIN.EMAIL_ERROR')}
                  secureTextEntry={false}
                />
              )}
              name="email"
            />

            <View style={style.forgotButtonView}>
              <LoaderButton
                style={style.forgotButton}
                loading={isResettingPassword}
                onPress={handleSubmit(onSubmit)}
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
