import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { ScrollView, Dimensions } from 'react-native';
import { View } from 'react-native';
import i18n from 'i18n';
import { Text, UserAvatar, Header } from 'components';
import createStyles from './ConversationDetailsScreen.style';
import SocialProfileIcons from './components/SocialProfileIcons';
import ContactDetails from './components/ContactDetails';
import LabelView from 'src/screens/ConversationDetails/components/LabelView';
import ConversationAttributes from './components/ConversationAttributes';
import ContactAttributes from './components/ContactAttributes';
import { actions as customAttributeActions } from 'reducer/customAttributeSlice';

// Bottom sheet items
const deviceHeight = Dimensions.get('window').height;
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import LabelConversationItems from 'src/screens/ChatScreen/components/ConversationLabels';

const ConversationDetailsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
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
        identifier,
        phone_number: phoneNumber,
        additional_attributes: senderAdditionalInfo = {},
      },
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
      iconName: 'brand-facebook',
    },
    {
      key: 'twitter',
      value: twitter,
      iconName: 'brand-twitter',
    },
    {
      key: 'linkedin',
      value: linkedin,
      iconName: 'brand-linkedin',
    },
    {
      key: 'github',
      value: github,
      iconName: 'brand-github',
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
      iconName: 'mail-outline',
    },
    {
      key: 'phoneNumber',
      value: phoneNumber,
      iconName: 'call-outline',
    },
    {
      key: 'identifier',
      value: identifier,
      iconName: 'contact-identify-outline',
    },
    {
      key: 'company',
      value: companyName,
      iconName: 'building-bank-outline',
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

  const labelActionModal = useRef(null);
  const labelActionModalSnapPoints = useMemo(() => [deviceHeight - 120, deviceHeight - 120], []);
  const toggleLabelActionModal = useCallback(() => {
    labelActionModal.current.present() || labelActionModal.current?.dismiss();
  }, []);
  const closeLabelActionModal = useCallback(() => {
    labelActionModal.current?.dismiss();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Header leftIcon="arrow-chevron-left-outline" onPressLeft={onBackPress} />
      <View style={styles.wrapper}>
        <View style={styles.detailsWrap}>
          <View style={styles.avatarContainer}>
            <UserAvatar
              thumbnail={thumbnail}
              userName={name}
              size={76}
              fontSize={30}
              defaultBGColor={colors.primary}
            />
          </View>
          <View>
            <Text bold lg color={colors.textDark}>
              {name}
            </Text>
          </View>
          {senderAdditionalInfo.description ? (
            <View style={styles.descriptionContainer}>
              <Text regular sm color={colors.textDark} style={styles.description}>
                {senderAdditionalInfo.description}
              </Text>
            </View>
          ) : null}
          <View style={styles.socialIconsContainer}>{getSocialProfileValue}</View>
          <View>{getContactDetails}</View>
        </View>
        <View style={styles.separatorView}>
          <View style={styles.separator}>
            <Text bold sm color={colors.textDark}>
              {i18n.t('CONVERSATION_LABELS.TITLE')}
            </Text>
          </View>
          <View style={styles.accordionItemWrapper}>
            <LabelView
              conversationDetails={conversationDetails}
              conversationId={conversationId}
              openLabelsBottomSheet={toggleLabelActionModal}
            />
          </View>
        </View>
        <ConversationAttributes conversationDetails={conversationDetails} />
        <ContactAttributes conversationDetails={conversationDetails} />
      </View>
      <BottomSheetModal
        bottomSheetModalRef={labelActionModal}
        initialSnapPoints={labelActionModalSnapPoints}
        showHeader
        headerTitle={i18n.t('CONVERSATION.LABELS')}
        closeFilter={closeLabelActionModal}
        children={
          <LabelConversationItems
            colors={colors}
            conversationDetails={conversationDetails}
            closeModal={closeLabelActionModal}
          />
        }
      />
    </ScrollView>
  );
};

const propTypes = {
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
export default ConversationDetailsScreen;
