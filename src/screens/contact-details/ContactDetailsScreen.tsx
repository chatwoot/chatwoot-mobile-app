import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import camelCase from 'camelcase';

import { TAB_BAR_HEIGHT } from '@/constants';
import {
  CallIcon,
  EmailIcon,
  LocationIcon,
  CompanyIcon,
  MessengerFilledIcon,
  XFilledIcon,
  TelegramFilledIcon,
  InstagramFilledIcon,
  GithubIcon,
  LinkedinIcon,
} from '@/svg-icons';
import { tailwind } from '@/theme';
import { AttributeListType, CustomAttribute, GenericListType } from '@/types';

import {
  ContactDetailsScreenHeader,
  ContactBasicActions,
  ContactMetaInformation,
} from './components';
import { AttributeList } from '@/components-next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactLabelActions } from '@/store/contact/contactLabelActions';
import { getContactCustomAttributes } from '@/store/custom-attribute/customAttributeSlice';
import { selectContactById } from '@/store/contact/contactSelectors';
import i18n from '@/i18n';

type ContactDetailsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'ContactDetails'
>;

const allSocialMediaProfiles: GenericListType[] = [
  {
    icon: <MessengerFilledIcon />,
    subtitle: 'Facebook',
    title: 'Facebook',
    subtitleType: 'dark',
    key: 'facebook',
    link: 'https://fb.com/',
  },
  {
    icon: <XFilledIcon />,
    subtitle: 'Twitter',
    title: 'Twitter',
    subtitleType: 'dark',
    key: 'twitter',
    link: 'https://x.com/',
  },
  {
    icon: <GithubIcon />,
    subtitle: 'Github',
    title: 'Github',
    subtitleType: 'dark',
    key: 'github',
    link: 'https://github.com/',
  },
  {
    icon: <LinkedinIcon />,
    subtitle: 'Linkedin',
    title: 'Linkedin',
    subtitleType: 'dark',
    key: 'linkedin',
    link: 'https://linkedin.com/',
  },
  {
    icon: <InstagramFilledIcon />,
    subtitle: 'Instagram',
    title: 'Instagram',
    subtitleType: 'dark',
    key: 'instagram',
    link: 'https://instagram/',
  },
  {
    icon: <TelegramFilledIcon />,
    subtitle: 'Telegram',
    title: 'Telegram',
    subtitleType: 'dark',
    key: 'telegram',
    link: 'https://t.me/',
  },
];

const processContactAttributes = (
  attributes: CustomAttribute[],
  customAttributes: Record<string, string>,
  filterCondition: (key: string, custom: Record<string, string>) => boolean,
) => {
  if (!attributes.length || !customAttributes) {
    return [];
  }

  return attributes.reduce<(CustomAttribute & { value: string })[]>((result, attribute) => {
    const { attributeKey } = attribute;
    const meetsCondition = filterCondition(camelCase(attributeKey), customAttributes);

    if (meetsCondition) {
      result.push({
        ...attribute,
        value: customAttributes[camelCase(attributeKey)] ?? '',
      });
    }

    return result;
  }, []);
};

const ContactDetailsScreen = (props: ContactDetailsScreenProps) => {
  const { conversationId } = props.route.params;
  const dispatch = useAppDispatch();

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const {
    meta: {
      sender: { email, id: contactId, name, thumbnail },
    },
  } = conversation || { meta: { sender: { name: '', thumbnail: '' } } };

  const contact = useAppSelector(state => (contactId ? selectContactById(state, contactId) : null));

  const { name: contactName, thumbnail: contactThumbnail, phoneNumber } = contact || {};

  const {
    city,
    country,
    description,
    location = '',
    companyName = '',
    socialProfiles,
    twitterScreenName,
    telegramUsername,
  } = contact?.additionalAttributes || {};

  const contactCustomAttributes = useAppSelector(getContactCustomAttributes);

  const usedContactCustomAttributes = processContactAttributes(
    contactCustomAttributes,
    contact?.customAttributes || {},
    (key, custom) => key in custom,
  );

  const socialMediaProfiles = {
    twitter: twitterScreenName,
    telegram: telegramUsername,
    ...(socialProfiles || {}),
  };

  const hasContactCustomAttributes = usedContactCustomAttributes.length > 0;

  useEffect(() => {
    if (contactId) {
      dispatch(contactLabelActions.getContactLabels({ contactId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socialMediaDetails = allSocialMediaProfiles
    .filter(profile => socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles])
    .map(profile => ({
      ...profile,
      subtitle: `${profile.link}${socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles]}`,
      type: 'link',
    }));

  const fullLocation =
    location || city || country !== undefined
      ? location || `${city}${city ? ',' : ''} ${country}`
      : null;

  const userDetails: GenericListType[] = [
    {
      icon: <LocationIcon />,
      subtitle: fullLocation || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: 'Location',
      subtitleType: 'dark',
    },
    {
      icon: <CallIcon />,
      subtitle: phoneNumber || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: 'Phone',
      subtitleType: 'dark',
    },
    {
      icon: <EmailIcon />,
      subtitle: email || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: 'Email',
      subtitleType: 'dark',
    },
    {
      icon: <CompanyIcon />,
      subtitle: companyName || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: 'Company',
      subtitleType: 'dark',
    },
  ];

  const allDetails = [...userDetails, ...socialMediaDetails];

  return (
    <View
      style={tailwind.style(
        `flex-1 bg-white pt-6 ${Platform.OS === 'android' ? 'pt-12' : 'pt-6'}`,
      )}>
      <ContactDetailsScreenHeader
        name={name || contactName || ''}
        thumbnail={thumbnail || contactThumbnail || ''}
        bio={description || ''}
      />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
        {email || phoneNumber ? (
          <Animated.View style={tailwind.style('mt-[23px] px-4')}>
            <ContactBasicActions phoneNumber={phoneNumber || ''} email={email || ''} />
          </Animated.View>
        ) : null}
        <Animated.View style={tailwind.style('pt-10')}>
          <AttributeList list={allDetails as AttributeListType[]} />
        </Animated.View>
        {hasContactCustomAttributes && (
          <Animated.View style={tailwind.style('pt-10')}>
            <ContactMetaInformation attributes={usedContactCustomAttributes} />
          </Animated.View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

export default ContactDetailsScreen;
