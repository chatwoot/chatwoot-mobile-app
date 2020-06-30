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

    const {
      conversationDetails: { contact, additional_attributes },
      meta,
    } = route.params;

    return (
      <SafeAreaView style={style.container}>
        <HeaderBar showLeftButton onBackPress={this.onBackPress} leftButtonIcon="close-outline" />
        <View style={style.avatarContainer}>
          <UserAvatar
            userName={contact.name}
            thumbnail={contact.thumbnail}
            size={86}
            fontSize={42}
            defaultBGColor={theme['color-primary-default']}
            channel={meta && meta.sender && meta.sender.channel}
          />
        </View>
        <View style={style.userNameContainer}>
          <CustomText style={style.nameLabel}>{contact.name}</CustomText>
        </View>
        {contact && contact.email && (
          <View style={style.userNameContainer}>
            <CustomText style={style.emailLabel}>{contact.email}</CustomText>
          </View>
        )}
        {contact && contact.additional_attributes && contact.additional_attributes.description && (
          <View style={style.descriptionContainer}>
            <CustomText style={style.description}>
              {contact.additional_attributes.description}
            </CustomText>
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
