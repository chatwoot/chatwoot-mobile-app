import React, { useEffect } from 'react';
import { withStyles } from '@ui-kitten/components';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { View } from 'react-native';

import UserAvatar from 'components/UserAvatar';
import CustomText from 'components/Text';
import i18n from 'i18n';

import styles from './ConversationDetailsScreen.style';

import HeaderBar from '../../components/HeaderBar';
import SocialProfileIcons from './components/SocialProfileIcons';
import ContactDetails from './components/ContactDetails';
import LabelView from 'src/screens/ConversationDetails/components/LabelView';
import ConversationAttributes from './components/ConversationAttributes';
import ContactAttributes from './components/ContactAttributes';
import { actions as customAttributeActions } from 'reducer/customAttributeSlice';

const ConversationDetailsScreen = ({ eva: { style }, navigation, route }) => {
  const dispatch = useDispatch();

  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    dispatch(customAttributeActions.getAllCustomAttributes());
  }, [dispatch]);

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

  const { id: conversationId } = conversationDetails;

  const {
    social_profiles: socialProfiles = {},
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
      value ? <SocialProfileIcons key={key} type={key} value={value} iconName={iconName} /> : null,
    )
    .filter(profile => !!profile);

  const contactDetails = [
    {
      key: 'email',
      value: email,
      iconName: 'email-outline',
    },
    {
      key: 'phoneNumber',
      value: phoneNumber,
      iconName: 'phone-call-outline',
    },
    {
      key: 'company',
      value: companyName,
      iconName: 'home-outline',
    },
    {
      key: 'location',
      value:
        location || city || country !== undefined
          ? location || `${city}${city ? ',' : ''} ${country}`
          : null,
      iconName: 'map-outline',
    },
  ];

  const getContactDetails = contactDetails
    .map(({ key, value, iconName }) =>
      value ? <ContactDetails key={key} type={key} value={value} iconName={iconName} /> : null,
    )
    .filter(details => !!details);

  return (
    <ScrollView style={style.container}>
      <HeaderBar showLeftButton onBackPress={onBackPress} />
      <View style={style.wrapper}>
        <View style={style.avatarContainer}>
          <UserAvatar
            userName={name}
            thumbnail={thumbnail}
            size={76}
            fontSize={30}
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
        <View>{getContactDetails}</View>
        <View style={style.separationView} />
        <View style={style.labelView}>
          <CustomText style={style.itemListViewTitle}>
            {i18n.t('CONVERSATION_LABELS.TITLE')}
          </CustomText>
          <LabelView conversationDetails={conversationDetails} conversationId={conversationId} />
        </View>
        <ConversationAttributes conversationDetails={conversationDetails} />
        <ContactAttributes conversationDetails={conversationDetails} />
      </View>
    </ScrollView>
  );
};

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      conversationDetails: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
  theme: PropTypes.object,
};
ConversationDetailsScreen.propTypes = propTypes;
const ConversationDetails = withStyles(ConversationDetailsScreen, styles);
export default ConversationDetails;
