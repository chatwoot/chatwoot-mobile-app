import React, { Component } from 'react';
import { Icon, Layout, TopNavigation, Toggle } from 'react-native-ui-kitten';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Image } from 'react-native';
import packageFile from '../../../package.json';
import UserAvatar from '../../components/UserAvatar';
import CustomText from '../../components/Text';
import { onLogOut } from '../../actions/auth';

import i18n from '../../i18n';

import images from '../../constants/images';
import { theme } from '../../theme';

import styles from './SettingsScreen.style';
import { getGravatarUrl } from '../../helpers';

const ItemIcon = props => (
  <Icon {...props} fill={theme['color-primary']} width={26} height={26} />
);

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

  logOut = () => {
    this.props.onLogOut();
  };

  render() {
    const {
      user: { email, name },
    } = this.props;
    const avatarUrl = getGravatarUrl({ email });
    return (
      <Layout style={styles.container}>
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
          <TouchableOpacity style={[styles.section, styles.enabledSection]}>
            <CustomText style={styles.sectionText}>
              {i18n.t('SETTINGS.AVAILABILITY')}
            </CustomText>

            <Toggle checked={false} size="small" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.section, styles.enabledSection]}>
            <CustomText style={styles.sectionText}>
              {i18n.t('SETTINGS.PUSH')}
            </CustomText>
            <Toggle checked size="small" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.section, styles.enabledSection]}>
            <CustomText style={styles.sectionText}>
              {i18n.t('SETTINGS.HELP')}
            </CustomText>
            <ItemIcon name="question-mark-circle-outline" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.section, styles.enabledSection]}
            onPress={this.logOut}>
            <CustomText style={styles.sectionText}>
              {i18n.t('SETTINGS.LOG_OUT')}
            </CustomText>
            <ItemIcon name="log-out-outline" />
          </TouchableOpacity>
        </View>
        <View style={styles.aboutView}>
          <Image style={styles.aboutImage} source={images.appLogo} />
        </View>

        <View style={styles.appDescriptionView}>
          <CustomText
            style={[styles.appDescriptionCustomText, styles.lastChild]}>
            {`v${packageFile.version}`}
          </CustomText>
        </View>
      </Layout>
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
