import React, { Component } from 'react';
import { withStyles, Icon } from '@ui-kitten/components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { View } from 'react-native';

import UserAvatar from '../../components/UserAvatar';
import CustomText from '../../components/Text';

import i18n from '../../i18n';

import styles from './ConversationDetailsScreen.style';

import { openURL, openNumber } from 'src/helpers/UrlHelper';

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
  };

  static defaultProps = {
    user: { email: null, name: null },
  };

  onBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  openFacebook = userName => {
    const URL = `https://www.facebook.com/${userName}`;
    return openURL({ URL: URL });
  };

  openTwitter = userName => {
    const URL = `https://twitter.com/${userName}`;
    return openURL({ URL: URL });
  };

  openLinkedIn = userName => {
    const URL = `https://www.linkedin.com/${userName}`;
    return openURL({ URL: URL });
  };

  openGitHub = userName => {
    const URL = `https://github.com/${userName}`;
    return openURL({ URL: URL });
  };

  renderAdditionalAttributes() {
    const {
      eva: { style },
      route,
    } = this.props;
    const { conversationDetails } = route.params;
    const { additional_attributes: additionalAttributes } = conversationDetails;
    const { meta } = conversationDetails;
    const { sender } = meta;
    if (!additionalAttributes) {
      return null;
    }
    const {
      browser: { browser_name, browser_version, platform_name, platform_version } = {},
      initiated_at = {},
    } = additionalAttributes;
    const { additional_attributes: { created_at_ip } = {} } = sender;
    return (
      <View style={style.itemListView}>
        {initiated_at.timestamp ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.INITIATED_AT')}
            value={initiated_at.timestamp}
          />
        ) : null}
        {additionalAttributes.referer ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.INITIATED_FROM')}
            value={additionalAttributes.referer}
            link
          />
        ) : null}
        {browser_name ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.BROWSER')}
            value={`${browser_name} ${browser_version}`}
          />
        ) : null}
        {platform_name ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.OPERATING_SYSTEM')}
            value={`${platform_name} ${platform_version}`}
          />
        ) : null}
        {created_at_ip ? (
          <ConversationDetailsItem
            title={i18n.t('CONVERSATION_DETAILS.IP_ADDRESS')}
            value={created_at_ip}
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
        sender: {
          additional_attributes: { city, country },
          name,
          thumbnail,
          email,
          phone_number: phoneNumber,
          additional_attributes: senderAdditionalInfo = {},
        },
        channel,
      },
    } = conversationDetails;

    const { social_profiles: socialProfiles } = senderAdditionalInfo;

    return (
      <ScrollView style={style.container}>
        <HeaderBar showLeftButton onBackPress={this.onBackPress} />
        <View style={style.wrapper}>
          <View style={style.avatarContainer}>
            <UserAvatar
              userName={name}
              thumbnail={thumbnail}
              size={76}
              fontSize={40}
              defaultBGColor={theme['color-primary-default']}
              channel={channel}
            />
          </View>
          <View style={style.userNameContainer}>
            <CustomText style={style.nameLabel}>{name}</CustomText>
          </View>
          {senderAdditionalInfo.description ? (
            <View style={style.descriptionContainer}>
              <CustomText style={style.description}>{senderAdditionalInfo.description}</CustomText>
            </View>
          ) : null}
          {socialProfiles ? (
            <View style={style.socialIconsContainer}>
              {socialProfiles.facebook ? (
                <View style={style.socialIconWrap}>
                  <Icon
                    style={style.socialIcon}
                    name="facebook-outline"
                    height={16}
                    width={16}
                    fill={theme['text-light-color']}
                    onPress={() => this.openFacebook(socialProfiles.facebook)}
                  />
                </View>
              ) : null}
              {socialProfiles.twitter ? (
                <View style={style.socialIconWrap}>
                  <Icon
                    style={style.socialIcon}
                    name="twitter-outline"
                    height={16}
                    width={16}
                    fill={theme['text-light-color']}
                    onPress={() => this.openTwitter(socialProfiles.twitter)}
                  />
                </View>
              ) : null}
              {socialProfiles.linkedin ? (
                <View style={style.socialIconWrap}>
                  <Icon
                    style={style.socialIcon}
                    name="linkedin-outline"
                    height={16}
                    width={16}
                    fill={theme['text-light-color']}
                    onPress={() => this.openLinkedIn(socialProfiles.linkedin)}
                  />
                </View>
              ) : null}
              {socialProfiles.github ? (
                <View style={style.socialIconWrap}>
                  <Icon
                    style={style.socialIcon}
                    name="github-outline"
                    height={16}
                    width={16}
                    fill={theme['text-light-color']}
                    onPress={() => this.openGitHub(socialProfiles.github)}
                  />
                </View>
              ) : null}
            </View>
          ) : null}
          {!!email && (
            <View style={style.detailsContainer}>
              <Icon
                name="email-outline"
                height={14}
                width={14}
                fill={theme['color-primary-default']}
              />
              <CustomText style={style.label}>{email}</CustomText>
            </View>
          )}
          {!!phoneNumber && (
            <View style={style.detailsContainer}>
              <Icon
                name="phone-call-outline"
                height={14}
                width={14}
                fill={theme['color-primary-default']}
                onPress={() => openNumber(phoneNumber)}
              />
              <CustomText style={style.label} onPress={() => openNumber(phoneNumber)}>
                {phoneNumber}
              </CustomText>
            </View>
          )}
          {senderAdditionalInfo.company_name ? (
            <View style={style.detailsContainer}>
              <Icon
                name="home-outline"
                height={14}
                width={14}
                fill={theme['color-primary-default']}
              />
              <CustomText style={style.label}>{senderAdditionalInfo.company_name}</CustomText>
            </View>
          ) : null}
          {senderAdditionalInfo.location || (city && country) ? (
            <View style={style.detailsContainer}>
              <Icon
                name="map-outline"
                height={14}
                width={14}
                fill={theme['color-primary-default']}
              />
              <CustomText style={style.label}>
                {senderAdditionalInfo.location || `${city}, ${country}`}
              </CustomText>
            </View>
          ) : null}
          <View style={style.separationView} />
          {this.renderAdditionalAttributes()}
        </View>
      </ScrollView>
    );
  }
}

function bindAction(dispatch) {
  return {};
}
function mapStateToProps(state) {
  return {
    user: state.auth.user,
  };
}

const ConversationDetails = withStyles(ConversationDetailsComponent, styles);
export default connect(mapStateToProps, bindAction)(ConversationDetails);
