import React, { Component } from 'react';
import { withStyles } from '@ui-kitten/components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';

import { View, Image } from 'react-native';
import packageFile from '../../../package.json';
import UserAvatar from '../../components/UserAvatar';
import CustomText from '../../components/Text';
import { onLogOut } from '../../actions/auth';

import i18n from '../../i18n';

import images from '../../constants/images';

import styles from './SettingsScreen.style';

import SettingsItem from '../../components/SettingsItem';
import { openURL } from '../../helpers/index.js';
import { HELP_URL } from '../../constants/url.js';
import HeaderBar from '../../components/HeaderBar';

import { getNotificationSettings } from '../../actions/settings';

const settingsData = [
  {
    text: 'SWITCH_ACCOUNT',
    checked: false,
    iconName: 'briefcase-outline',
    itemName: 'switch-account',
  },

  {
    text: 'AVAILABILITY',
    checked: true,
    iconName: 'radio-outline',
    itemName: 'availability',
  },

  {
    text: 'NOTIFICATION',
    checked: true,
    iconName: 'bell-outline',
    itemName: 'notification',
  },
  {
    text: 'CHANGE_LANGUAGE',
    checked: true,
    iconName: 'globe-outline',
    itemName: 'language',
  },
  {
    text: 'HELP',
    checked: true,
    iconName: 'question-mark-circle-outline',
    itemName: 'help',
  },
  {
    text: 'LOG_OUT',
    checked: false,
    iconName: 'log-out-outline',
    itemName: 'logout',
  },
];

class SettingsComponent extends Component {
  state = { settingsMenu: [] };
  static propTypes = {
    eva: PropTypes.shape({
      style: PropTypes.object,
      theme: PropTypes.object,
    }).isRequired,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      avatar_url: PropTypes.string,
      accounts: PropTypes.array,
    }).isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    onLogOut: PropTypes.func,
    availabilityStatus: PropTypes.string,
    getNotificationSettings: PropTypes.func,
  };

  static defaultProps = {
    user: { email: null, name: null },
    onLogOut: () => {},
  };

  onPressItem = ({ itemName }) => {
    const {
      navigation,
      user: { accounts },
    } = this.props;

    switch (itemName) {
      case 'language':
        navigation.navigate('Language');
        break;

      case 'logout':
        this.props.onLogOut();
        break;

      case 'switch-account':
        navigation.navigate('Account', { accounts });
        break;

      case 'availability':
        navigation.navigate('Availability');
        break;

      case 'notification':
        navigation.navigate('NotificationPreference', { accounts });
        break;

      case 'help':
        openURL({ URL: HELP_URL });
        break;

      default:
        break;
    }
  };

  componentDidMount = () => {
    this.props.getNotificationSettings();
  };

  render() {
    const {
      user: { email, name, avatar_url, accounts },
      eva: { style, theme },
      availabilityStatus,
    } = this.props;

    // Show  switch account option only if number of accounts is greater than one
    const settingsMenu =
      accounts && accounts.length > 1
        ? settingsData
        : settingsData.filter((e) => e.itemName !== 'switch-account');

    return (
      <SafeAreaView style={style.container}>
        <HeaderBar title={i18n.t('SETTINGS.HEADER_TITLE')} />
        <View style={style.profileContainer}>
          <UserAvatar
            userName={name}
            thumbnail={avatar_url}
            defaultBGColor={theme['color-primary-default']}
            availabilityStatus={availabilityStatus}
          />
          <View style={style.detailsContainer}>
            <CustomText style={style.nameLabel}>{name}</CustomText>
            <CustomText style={style.emailLabel}>{email}</CustomText>
          </View>
        </View>
        <View style={style.itemListView}>
          {settingsMenu.map((item, index) => (
            <SettingsItem
              key={item.text}
              text={i18n.t(`SETTINGS.${item.text}`)}
              checked={item.checked}
              iconSize={item.iconSize}
              itemType={item.itemType}
              iconName={item.iconName}
              itemName={item.itemName}
              onPressItem={this.onPressItem}
            />
          ))}
        </View>
        <View style={style.aboutView}>
          <Image style={style.aboutImage} source={images.appLogo} />
        </View>

        <View style={style.appDescriptionView}>
          <CustomText style={style.appDescriptionText}>{`v${packageFile.version}`}</CustomText>
        </View>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    onLogOut: () => dispatch(onLogOut()),
    getNotificationSettings: () => dispatch(getNotificationSettings()),
  };
}
function mapStateToProps(state) {
  return {
    user: state.auth.user,
    availabilityStatus: state.auth.user ? state.auth.user.availability_status : '',
  };
}

const Settings = withStyles(SettingsComponent, styles);
export default connect(mapStateToProps, bindAction)(Settings);
