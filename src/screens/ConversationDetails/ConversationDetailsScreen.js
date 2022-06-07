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

import { openNumber } from 'src/helpers/UrlHelper';

import HeaderBar from '../../components/HeaderBar';
import ConversationDetailsItem from '../../components/ConversationDetailsItem';
import SocialProfileIcons from './components/SocialProfileIcons';

import { getAllCustomAttributes } from 'actions/conversation';

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
    attributes: PropTypes.array.isRequired,
    getAllCustomAttributes: PropTypes.func,
  };

  static defaultProps = {
    user: { email: null, name: null },
    attributes: [],
  };

  componentDidMount = () => {
    this.props.getAllCustomAttributes();
  };

  onBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  renderConversationAttributes() {
    const {
      eva: { style },
      route,
      attributes,
    } = this.props;
    const { conversationDetails } = route.params;
    const { additional_attributes: additionalAttributes } = conversationDetails;
    const { meta } = conversationDetails;
    const { sender } = meta;
    if (!additionalAttributes) {
      return null;
    }

    const { custom_attributes: conversationAttributes } = conversationDetails;

    const {
      browser: {
        browser_name: browserName,
        browser_version: browserVersion,
        platform_name: platformName,
        platform_version: platformVersion,
      } = {},
      initiated_at: { timestamp } = {},
      referer,
    } = additionalAttributes;
    const { additional_attributes: { created_at_ip: createdAtIp } = {} } = sender;

    const displayKeys = [
      {
        key: 'timestamp',
        value: timestamp,
        title: i18n.t('CONVERSATION_DETAILS.INITIATED_AT'),
      },
      {
        key: 'referer',
        value: referer,
        title: i18n.t('CONVERSATION_DETAILS.INITIATED_FROM'),
      },
      {
        key: 'browserName',
        value: `${browserName} ${browserVersion}`,
        title: i18n.t('CONVERSATION_DETAILS.BROWSER'),
      },
      {
        key: 'platformName',
        value: `${platformName} ${platformVersion}`,
        title: i18n.t('CONVERSATION_DETAILS.OPERATING_SYSTEM'),
      },
      {
        key: 'createdAtIp',
        value: createdAtIp,
        title: i18n.t('CONVERSATION_DETAILS.IP_ADDRESS'),
      },
    ];

    const displayItems = displayKeys
      .map(({ key, value, title }) =>
        value ? <ConversationDetailsItem title={title} value={value} type={key} /> : null,
      )
      .filter(displayItem => !!displayItem);

    const getConversationAttributes = () => {
      return attributes
        .filter(attribute => attribute.attribute_model === 'conversation_attribute')
        .map(attribute => {
          const { attribute_key: attributeKey, attribute_display_name: displayName } = attribute;
          return (
            <ConversationDetailsItem
              title={displayName}
              value={String(conversationAttributes[attributeKey])}
              type={attributeKey}
            />
          );
        });
    };

    return (
      <View>
        <CustomText style={style.itemListViewTitle}>{'Conversation Information'}</CustomText>
        <View style={style.itemListView}>
          {displayItems}
          {getConversationAttributes()}
        </View>
        <View style={style.separationView} />
      </View>
    );
  }

  renderContactAttributes() {
    const {
      eva: { style },
      route,
    } = this.props;
    const { conversationDetails } = route.params;
    const { meta } = conversationDetails;
    const { sender } = meta;
    const { custom_attributes: contactAttributes } = sender;

    if (contactAttributes === {}) {
      return null;
    }

    return (
      <View>
        <CustomText style={style.itemListViewTitle}>{'Contact Attributes'}</CustomText>
        <View style={style.itemListView}>
          {Object.keys(contactAttributes).map(key => {
            return (
              <ConversationDetailsItem
                title={key}
                value={String(contactAttributes[key])}
                type={key}
              />
            );
          })}
        </View>
        <View style={style.separationView} />
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

    const {
      social_profiles: socialProfiles,
      company_name: companyName,
      location,
    } = senderAdditionalInfo;
    const { facebook, twitter, linkedin, github } = socialProfiles;

    const socialProfileTypes = [
      {
        key: 'facebook',
        value: facebook,
        iconName: 'facebook-outline',
      },
      {
        key: 'twitter',
        value: twitter,
        iconName: 'twitter-outline',
      },
      {
        key: 'linkedin',
        value: linkedin,
        iconName: 'linkedin-outline',
      },
      {
        key: 'github',
        value: github,
        iconName: 'github-outline',
      },
    ];

    const getSocialProfileValue = socialProfileTypes
      .map(({ key, value, iconName }) =>
        value ? <SocialProfileIcons type={key} value={value} iconName={iconName} /> : null,
      )
      .filter(profile => !!profile);

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
          <View style={style.socialIconsContainer}>{getSocialProfileValue}</View>
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
          {companyName ? (
            <View style={style.detailsContainer}>
              <Icon
                name="home-outline"
                height={14}
                width={14}
                fill={theme['color-primary-default']}
              />
              <CustomText style={style.label}>{companyName}</CustomText>
            </View>
          ) : null}
          {location || (city && country) ? (
            <View style={style.detailsContainer}>
              <Icon
                name="map-outline"
                height={14}
                width={14}
                fill={theme['color-primary-default']}
              />
              <CustomText style={style.label}>{location || `${city}, ${country}`}</CustomText>
            </View>
          ) : null}
          <View style={style.separationView} />
          {this.renderConversationAttributes()}
          {this.renderContactAttributes()}
        </View>
      </ScrollView>
    );
  }
}

function bindAction(dispatch) {
  return {
    getAllCustomAttributes: () => dispatch(getAllCustomAttributes()),
  };
}
function mapStateToProps(state) {
  return {
    user: state.auth.user,
    attributes: state.conversation.customAttributes,
  };
}

const ConversationDetails = withStyles(ConversationDetailsComponent, styles);
export default connect(mapStateToProps, bindAction)(ConversationDetails);
