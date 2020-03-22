import React, { Component } from 'react';
import { TopNavigation, withStyles } from '@ui-kitten/components';
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
const settingsData = [
  {
    text: i18n.t('SETTINGS.HELP'),
    checked: true,
    iconName: 'question-mark-circle-outline',
    itemName: 'help',
  },
  {
    text: i18n.t('SETTINGS.LOG_OUT'),
    checked: false,
    iconName: 'log-out-outline',
    itemName: 'logout',
  },
];
class SettingsComponent extends Component {
  static propTypes = {
    themedStyle: PropTypes.object,
    theme: PropTypes.object,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }).isRequired,

    switchTheme: PropTypes.func,
    onLogOut: PropTypes.func,
  };

  static defaultProps = {
    user: { email: null, name: null },
    switchTheme: () => {},
    onLogOut: () => {},
  };

  onPressItem = ({ itemName }) => {
    switch (itemName) {
      case 'theme':
        this.props.switchTheme();
        break;

      case 'logout':
        this.props.onLogOut();
        break;

      case 'help':
        openURL({ URL: HELP_URL });
        break;

      default:
        break;
    }
  };

  render() {
    const {
      user: { email, name, avatar_url },
      themedStyle,
    } = this.props;
    return (
      <SafeAreaView style={themedStyle.container}>
        <TopNavigation
          title={i18n.t('SETTINGS.HEADER_TITLE')}
          titleStyle={themedStyle.headerTitle}
          alignment="center"
        />
        <View style={themedStyle.profileContainer}>
          <UserAvatar userName={name} size="giant" thumbnail={avatar_url} />
          <View style={themedStyle.detailsContainer}>
            <CustomText style={themedStyle.nameLabel}>{name}</CustomText>
            <CustomText style={themedStyle.emailLabel}>{email}</CustomText>
          </View>
        </View>
        <View style={themedStyle.itemListView}>
          {settingsData.map((item, index) => (
            <SettingsItem
              key={item.text}
              text={item.text}
              checked={item.checked}
              iconSize={item.iconSize}
              itemType={item.itemType}
              iconName={item.iconName}
              itemName={item.itemName}
              onPressItem={this.onPressItem}
            />
          ))}
        </View>
        <View style={themedStyle.aboutView}>
          <Image style={themedStyle.aboutImage} source={images.appLogo} />
        </View>

        <View style={themedStyle.appDescriptionView}>
          <CustomText style={themedStyle.appDescriptionText}>
            {`v${packageFile.version}`}
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    onLogOut: () => dispatch(onLogOut()),
  };
}
function mapStateToProps(state) {
  return {
    user: state.auth.user,
  };
}

const Settings = withStyles(SettingsComponent, styles);
export default connect(mapStateToProps, bindAction)(Settings);
