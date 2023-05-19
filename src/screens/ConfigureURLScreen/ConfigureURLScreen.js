import React, { useMemo, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Image, SafeAreaView, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Text, Header } from 'components';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';
import { useForm, Controller } from 'react-hook-form';
import createStyles from './ConfigureURLScreen.style';
import images from '../../constants/images';
import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { ScrollView } from 'react-native-gesture-handler';
import TextInput from '../../components/TextInput';
import { URL_WITHOUT_HTTP_REGEX } from '../../helpers/formHelper';
import {
  selectIsSettingUrl,
  selectBaseUrl,
  actions as settingsActions,
  resetSettings,
} from 'reducer/settingsSlice';

const appName = DeviceInfo.getApplicationName();

const propTypes = {
  theme: PropTypes.object,
  setInstallationUrl: PropTypes.func,
  resetSettings: PropTypes.func,
  isSettingUrl: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
  setInstallationUrl: () => {},
  isSettingUrl: false,
};

const ConfigureURLScreenComponent = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const baseUrl = useSelector(selectBaseUrl);
  const isSettingUrl = useSelector(selectIsSettingUrl);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      url: baseUrl ? baseUrl : appName === 'Chatwoot' ? 'app.chatwoot.com' : '',
    },
  });

  useEffect(() => {
    dispatch(resetSettings());
  }, [dispatch]);

  const onSubmit = data => {
    const { url } = data;
    if (url) {
      dispatch(settingsActions.setInstallationUrl({ url }));
    }
  };

  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled>
      <Header leftIcon="arrow-chevron-left-outline" onPressLeft={onBackPress} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.logoView}>
          <Image style={styles.logo} source={images.URL} />
        </View>

        <View style={styles.titleView}>
          <Text lg medium color={colors.textDark} style={styles.titleText}>
            {i18n.t('CONFIGURE_URL.ENTER_URL')}
          </Text>
          <Text sm color={colors.textLight} style={styles.subTitleText}>
            {i18n.t('CONFIGURE_URL.DESCRIPTION')}
          </Text>
        </View>

        <View style={styles.formView}>
          <View>
            <Controller
              control={control}
              rules={{
                required: i18n.t('CONFIGURE_URL.URL_REQUIRED'),
                pattern: {
                  value: URL_WITHOUT_HTTP_REGEX,
                  message: i18n.t('CONFIGURE_URL.URL_ERROR'),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errors={errors}
                  error={errors.url}
                  label=""
                  secureTextEntry={false}
                  placeholder="Eg: app.chatwoot.com"
                />
              )}
              name="url"
            />
          </View>
          <View style={styles.nextButtonView}>
            <LoaderButton
              style={styles.nextButton}
              loading={isSettingUrl}
              colorScheme="primary"
              onPress={handleSubmit(onSubmit)}
              size="expanded"
              text={i18n.t('CONFIGURE_URL.CONNECT')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

ConfigureURLScreenComponent.propTypes = propTypes;
ConfigureURLScreenComponent.defaultProps = defaultProps;
export default ConfigureURLScreenComponent;
