import React, { useEffect } from 'react';

import { View, Image, SafeAreaView, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';
import { useForm, Controller } from 'react-hook-form';

import { setInstallationUrl, resetSettings } from '../../actions/settings';
import styles from './ConfigureURLScreen.style';
import images from '../../constants/images';
import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { ScrollView } from 'react-native-gesture-handler';
import CustomText from '../../components/Text';
import TextInput from '../../components/TextInput';
import { URL_WITHOUT_HTTP_REGEX } from '../../helpers/formHelper';

const appName = DeviceInfo.getApplicationName();

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  theme: PropTypes.object,
  setInstallationUrl: PropTypes.func,
  resetSettings: PropTypes.func,
  isSettingUrl: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
  setInstallationUrl: () => {},
  isSettingUrl: false,
};

const ConfigureURLScreenComponent = ({ eva }) => {
  const isSettingUrl = useSelector(state => state.settings.isSettingUrl);
  const dispatch = useDispatch();

  const { style } = eva;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      url: appName === 'Chatwoot' ? 'app.chatwoot.com' : null,
    },
  });

  useEffect(() => {
    dispatch(resetSettings());
  }, [dispatch]);

  const onSubmit = data => {
    const { url } = data;
    if (url) {
      dispatch(setInstallationUrl({ url }));
    }
  };

  return (
    <SafeAreaView
      style={style.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled>
      <ScrollView contentContainerStyle={style.scrollView}>
        <View style={style.logoView}>
          <Image style={style.logo} source={images.URL} />
        </View>

        <View style={style.titleView}>
          <CustomText style={style.titleText}>{i18n.t('CONFIGURE_URL.ENTER_URL')}</CustomText>
          <CustomText appearance="hint" style={style.subTitleText}>
            {i18n.t('CONFIGURE_URL.DESCRIPTION')}
          </CustomText>
        </View>

        <View style={style.formView}>
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
          <View style={style.nextButtonView}>
            <LoaderButton
              style={style.nextButton}
              loading={isSettingUrl}
              onPress={handleSubmit(onSubmit)}
              size="large"
              textStyle={style.nextButtonText}
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

const ConfigureURLScreen = withStyles(ConfigureURLScreenComponent, styles);
export default ConfigureURLScreen;
