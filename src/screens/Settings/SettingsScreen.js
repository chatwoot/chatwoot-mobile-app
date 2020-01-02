import React, { Component } from 'react';
import { TopNavigation } from 'react-native-ui-kitten';
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
import { getGravatarUrl } from '../../helpers';
import SettingsItem from '../../components/SettingsItem.js';
const settingsData = [
  {
    text: i18n.t('SETTINGS.AVAILABILITY'),
    checked: false,
    iconSize: 'small',
    itemType: 'toggle',
  },
  {
    text: i18n.t('SETTINGS.PUSH'),
    checked: false,
    iconSize: 'small',
    itemType: 'toggle',
  },
  {
    text: i18n.t('SETTINGS.HELP'),
    checked: true,
    iconName: 'question-mark-circle-outline',
  },
  {
    text: i18n.t('SETTINGS.LOG_OUT'),
    checked: false,
    iconName: 'log-out-outline',
    itemName: 'logout',
  },
];
class Settings extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }).isRequired,

    onLogOut: PropTypes.func,
  };

  static defaultProps = {
    user: { email: null, name: null },
    onLogOut: () => {},
  };

  onPressItem = ({ itemName }) => {
    if (itemName === 'logout') {
      this.props.onLogOut();
    }
  };

  render() {
    const {
      user: { email, name },
    } = this.props;
    const avatarUrl = getGravatarUrl({ email });
    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title={i18n.t('SETTINGS.HEADER_TITLE')}
          titleStyle={styles.headerTitle}
          alignment="center"
        />
        <View style={styles.profileContainer}>
          <UserAvatar thumbnail={avatarUrl} userName={name} size="giant" />
          <View style={styles.detailsContainer}>
            <CustomText style={styles.nameLabel}>{name}</CustomText>
            <CustomText style={styles.emailLabel}>{email}</CustomText>
          </View>
        </View>
        <View style={styles.itemListView}>
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
        <View style={styles.aboutView}>
          <Image style={styles.aboutImage} source={images.appLogo} />
        </View>

        <View style={styles.appDescriptionView}>
          <CustomText style={styles.appDescriptionView}>
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

export default connect(mapStateToProps, bindAction)(Settings);
