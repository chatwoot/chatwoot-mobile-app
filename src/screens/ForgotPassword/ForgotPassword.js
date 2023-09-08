import React, { useEffect, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { View, SafeAreaView, Image, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { Text, Header } from 'components';
import { Keyboard } from 'react-native';
import createStyles from './ForgotPassword.style';
import TextInput from '../../components/TextInput';
import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import images from '../../constants/images';
import { EMAIL_REGEX } from '../../helpers/formHelper';
import { ACCOUNT_EVENTS } from 'constants/analyticsEvents';
import { actions as authActions, resetAuth, selectIsResettingPassword } from 'reducer/authSlice';
import AnalyticsHelper from 'helpers/AnalyticsHelper';

const propTypes = {
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

const ForgotPasswordComponent = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    dispatch(authActions.onResetPassword({ email }));
    AnalyticsHelper.track(ACCOUNT_EVENTS.FORGOT_PASSWORD);
  };

  const isResettingPassword = useSelector(selectIsResettingPassword);

  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const onBackPress = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.mainView}>
      <Header
        headerText={i18n.t('FORGOT_PASSWORD.HEADER_TITLE')}
        leftIcon="arrow-chevron-left-outline"
        onPressLeft={onBackPress}
      />
      <ScrollView>
        <View style={styles.logoView}>
          <Image style={styles.logo} source={images.forgotPassword} />
        </View>

        <View style={styles.titleView}>
          <Text lg medium color={colors.textDark} style={styles.titleText}>
            {i18n.t('FORGOT_PASSWORD.TITLE')}
          </Text>
        </View>
        <View style={styles.titleView}>
          <Text sm color={colors.textLight} style={styles.subTitleText}>
            {i18n.t('FORGOT_PASSWORD.SUB_TITLE')}
          </Text>
        </View>

        <View>
          <View style={styles.formView}>
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

            <View style={styles.forgotButtonView}>
              <LoaderButton
                style={styles.forgotButton}
                loading={isResettingPassword}
                onPress={handleSubmit(onSubmit)}
                size="expanded"
                colorScheme="primary"
                text={i18n.t('FORGOT_PASSWORD.RESET_HERE')}
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

export default ForgotPasswordComponent;
