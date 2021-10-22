import React, { Component } from 'react';
import { withStyles } from '@ui-kitten/components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { View } from 'react-native';

import UserAvatar from '../../components/UserAvatar';
import CustomText from '../../components/Text';
import { onLogOut } from '../../actions/auth';

import i18n from '../../i18n';

import styles from './ConversationDetailsScreen.style';

import HeaderBar from '../../components/HeaderBar';
import ConversationDetailsItem from '../../components/ConversationDetailsItem';

class ConversationDetailsComponent extends Component {
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
      goBack: PropTypes.func.isRequired,
    }).isRequired,
    route: PropTypes.object,
    onLogOut: PropTypes.func,
  };

  static defaultProps = {
    user: { email: null, name: null },
    onLogOut: () => {},
  };

  onBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  renderAdditionalAttributes() {
    const {
      eva: { style },
      route,
    } = this.props;
    const { conversationDetails } = route.params;
    const { additional_attributes: additionalAttributes } = conversationDetails;
    if (!additionalAttributes) {
      return null;
    }
    const {
      browser: { browser_name, browser_version, platform_name, platform_version } = {},
      initiated_at = {},
    } = additionalAttributes;
    return (
      <View style={style.itemListView}>
        {browser_name ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.BROWSER')}
            value={`${browser_name} ${browser_version}`}
            iconName="globe-outline"
          />
        ) : null}
        {platform_name ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.OPERATING_SYSTEM')}
            value={`${platform_name} ${platform_version}`}
            iconName="hard-drive-outline"
          />
        ) : null}
        {additionalAttributes.referer ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.INITIATED_FROM')}
            value={additionalAttributes.referer}
            iconName="link-outline"
          />
        ) : null}
        {initiated_at.timestamp ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.INITIATED_AT')}
            value={initiated_at.timestamp}
            iconName="clock-outline"
          />
        ) : null}
      </View>
    );
  }

  render() {
    const {
      eva: { style, theme },
      route,
    } = this.props;
    const { conversationDetails } = route.params;
    const {
      meta: {
        sender: { name, thumbnail, email, additional_attributes: senderAdditionalInfo = {} },
        channel,
      },
    } = conversationDetails;
    return (
      <ScrollView style={style.container}>
        <HeaderBar showLeftButton onBackPress={this.onBackPress} leftButtonIcon="close-outline" />
        <View style={style.avatarContainer}>
          <UserAvatar
            userName={name}
            thumbnail={thumbnail}
            size={86}
            fontSize={42}
            defaultBGColor={theme['color-primary-default']}
            channel={channel}
          />
        </View>
        <View style={style.userNameContainer}>
          <CustomText style={style.nameLabel}>{name}</CustomText>
        </View>
        {!!email && (
          <View style={style.userNameContainer}>
            <CustomText style={style.emailLabel}>{email}</CustomText>
          </View>
        )}
        {senderAdditionalInfo.description ? (
          <View style={style.descriptionContainer}>
            <CustomText style={style.description}>{senderAdditionalInfo.description}</CustomText>
          </View>
        ) : null}
        {senderAdditionalInfo.location ? (
          <View style={style.descriptionContainer}>
            <CustomText style={style.description}>{senderAdditionalInfo.location}</CustomText>
          </View>
        ) : null}
        <View style={style.separationView} />
        {this.renderAdditionalAttributes()}
      </ScrollView>
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

const ConversationDetails = withStyles(ConversationDetailsComponent, styles);
export default connect(mapStateToProps, bindAction)(ConversationDetails);
