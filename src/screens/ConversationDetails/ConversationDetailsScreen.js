import React, { Component } from 'react';
import { withStyles } from '@ui-kitten/components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
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

  render() {
    const {
      eva: { style, theme },
      route,
    } = this.props;
    const { conversationDetails } = route.params;
    const {
      additional_attributes,
      meta: {
        sender: { name, thumbnail, email, additional_attributes: senderAdditionalInfo },
        channel,
      },
    } = conversationDetails;

    return (
      <SafeAreaView style={style.container}>
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
        {email && (
          <View style={style.userNameContainer}>
            <CustomText style={style.emailLabel}>{email}</CustomText>
          </View>
        )}

        {senderAdditionalInfo && senderAdditionalInfo.description !== '' && (
          <View style={style.descriptionContainer}>
            <CustomText style={style.description}>{senderAdditionalInfo.description}</CustomText>
          </View>
        )}
        {senderAdditionalInfo && senderAdditionalInfo.location !== '' && (
          <View style={style.descriptionContainer}>
            <CustomText style={style.description}>{senderAdditionalInfo.location}</CustomText>
          </View>
        )}

        <View style={style.separationView} />
        <View style={style.itemListView}>
          {additional_attributes &&
            additional_attributes.browser &&
            additional_attributes.browser.browser_name && (
              <ConversationDetailsItem
                title={i18n.t('CONVERSATION_DETAILS.BROWSER')}
                value={`${additional_attributes.browser.browser_name} ${additional_attributes.browser.browser_version}`}
                iconName="globe-outline"
              />
            )}
          {additional_attributes &&
            additional_attributes.browser &&
            additional_attributes.browser.platform_name && (
              <ConversationDetailsItem
                title={i18n.t('CONVERSATION_DETAILS.OPERATING_SYSTEM')}
                value={`${additional_attributes.browser.platform_name} ${additional_attributes.browser.platform_version}`}
                iconName="hard-drive-outline"
              />
            )}
          {additional_attributes && additional_attributes.referer && (
            <ConversationDetailsItem
              title={i18n.t('CONVERSATION_DETAILS.INITIATED_FROM')}
              value={additional_attributes.referer}
              iconName="link-outline"
            />
          )}
          {additional_attributes &&
            additional_attributes.initiated_at &&
            additional_attributes.initiated_at.timestamp && (
              <ConversationDetailsItem
                title={i18n.t('CONVERSATION_DETAILS.INITIATED_AT')}
                value={additional_attributes.initiated_at.timestamp}
                iconName="clock-outline"
              />
            )}
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

const ConversationDetails = withStyles(ConversationDetailsComponent, styles);
export default connect(mapStateToProps, bindAction)(ConversationDetails);
