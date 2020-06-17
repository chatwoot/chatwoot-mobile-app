import React, { useEffect, useState, useRef } from 'react';

import { View, Image, KeyboardAvoidingView, Dimensions, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { withStyles } from '@ui-kitten/components';
import t from 'tcomb-form-native';
import PropTypes from 'prop-types';

import { setInstallationUrl, resetSettings } from '../../actions/settings';
import styles from './ConfigureURLScreen.style';
import { URL } from '../../helpers/formHelper';
import TextInputField from '../../components/TextInputField';
import images from '../../constants/images';
import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { ScrollView } from 'react-native-gesture-handler';

const { Form } = t.form;
const URLForm = t.struct({
  url: URL,
});

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
  const isSettingUrl = useSelector((state) => state.settings.isSettingUrl);
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [values, setValues] = useState({
    url: 'chatwoot-mobile-app-test.herokuapp.com',
  });

  const options = {
    fields: {
      url: {
        placeholder: 'Ex: app.chatwoot.com',
        template: (props) => <TextInputField {...props} />,
        error: i18n.t('CONFIGURE_URL.URL_ERROR'),
        autoCapitalize: 'none',
        config: {
          label: i18n.t('CONFIGURE_URL.ENTER_URL'),
        },
      },
    },
  };

  const { style } = eva;

  useEffect(() => {
    dispatch(resetSettings());
  }, [dispatch]);

  const onChange = (value) => {
    setValues(value);
  };

  const onSubmit = () => {
    const value = inputRef.current.getValue();

    if (value) {
      const { url } = value;
      dispatch(setInstallationUrl({ url }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={style.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled>
      <ScrollView
        style={{
          height: Dimensions.get('window').height,
        }}>
        <View style={style.logoView}>
          <Image style={style.logo} source={images.appLogo} />
        </View>

        <View style={style.formView}>
          <Form
            ref={inputRef}
            type={URLForm}
            options={options}
            value={values}
            onChange={(value) => onChange(value)}
          />
          <View style={style.nextButtonView}>
            <LoaderButton
              style={style.nextButton}
              loading={isSettingUrl}
              onPress={() => onSubmit()}
              size="large"
              textStyle={style.nextButtonText}
              text={i18n.t('CONFIGURE_URL.NEXT')}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

ConfigureURLScreenComponent.propTypes = propTypes;
ConfigureURLScreenComponent.defaultProps = defaultProps;

const ConfigureURLScreen = withStyles(ConfigureURLScreenComponent, styles);
export default ConfigureURLScreen;
