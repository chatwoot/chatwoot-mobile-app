import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Image,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
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

class ConfigureURLScreenComponent extends Component {
  static propTypes = {
    themedStyle: PropTypes.object,
    theme: PropTypes.object,
    setInstallationUrl: PropTypes.func,
    resetSettings: PropTypes.func,
    isSettingUrl: PropTypes.bool,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    setInstallationUrl: () => {},
    isSettingUrl: false,
  };

  state = {
    values: {
      url: '',
    },
    options: {
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
    },
  };

  componentDidMount = () => {
    this.props.resetSettings();
  };

  onChange(values) {
    this.setState({
      values,
    });
  }

  onSubmit() {
    const value = this.formRef.getValue();

    if (value) {
      const { url } = value;
      this.props.setInstallationUrl({ url });
    }
  }

  render() {
    const { options, values } = this.state;
    const { isSettingUrl, themedStyle } = this.props;

    return (
      <KeyboardAvoidingView
        style={themedStyle.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled>
        <ScrollView
          style={{
            height: Dimensions.get('window').height,
          }}>
          <View style={themedStyle.logoView}>
            <Image style={themedStyle.logo} source={images.appLogo} />
          </View>

          <View style={themedStyle.formView}>
            <Form
              ref={(ref) => {
                this.formRef = ref;
              }}
              type={URLForm}
              options={options}
              value={values}
              onChange={(value) => this.onChange(value)}
            />
            <View style={themedStyle.nextButtonView}>
              <LoaderButton
                style={themedStyle.nextButton}
                loading={isSettingUrl}
                onPress={() => this.onSubmit()}
                size="large"
                textStyle={themedStyle.nextButtonText}>
                {i18n.t('CONFIGURE_URL.NEXT')}
              </LoaderButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

function bindAction(dispatch) {
  return {
    setInstallationUrl: (data) => dispatch(setInstallationUrl(data)),
    resetSettings: () => dispatch(resetSettings()),
  };
}
function mapStateToProps(state) {
  return {
    isSettingUrl: state.settings.isSettingUrl,
  };
}

const ConfigureURLScreen = withStyles(ConfigureURLScreenComponent, styles);
export default connect(mapStateToProps, bindAction)(ConfigureURLScreen);
