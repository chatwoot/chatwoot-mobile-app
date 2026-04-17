import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import camelCase from 'camelcase';

import { INBOX_TYPES, TAB_BAR_HEIGHT } from '@/constants';
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
  ContactLabelActions,
} from './components';
import { AttributeList } from '@/components-next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactLabelActions } from '@/store/contact/contactLabelActions';
import { getContactCustomAttributes } from '@/store/custom-attribute/customAttributeSlice';
import { selectContactById } from '@/store/contact/contactSelectors';
import { selectContactLabelsByContactId } from '@/store/contact/contactLabelSlice';
import i18n from '@/i18n';
import { apiService } from '@/services/APIService';
import { transformContact } from '@/utils/camelCaseKeys';
import { addContact } from '@/store/contact/contactSlice';

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
    link: 'https://instagram.com/',
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

const TELEGRAM_LINK_PREFIX = 'https://t.me/';

const sanitizeTelegramUsername = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .replace(/^https?:\/\/(?:www\.)?t\.me\//i, '')
    .replace(/^@/, '');
};

const ContactDetailsScreen = (props: ContactDetailsScreenProps) => {
  const { conversationId, contactId: routeContactId } = props.route.params;
  const dispatch = useAppDispatch();

  const conversation = useAppSelector(state =>
    conversationId ? selectConversationById(state, conversationId) : null,
  );

  const contactIdFromConversation = conversation?.meta?.sender?.id;
  const contactId = routeContactId || contactIdFromConversation;

  const emailFromConversation = conversation?.meta?.sender?.email;
  const nameFromConversation = conversation?.meta?.sender?.name;
  const thumbnailFromConversation = conversation?.meta?.sender?.thumbnail;

  const contact = useAppSelector(state => (contactId ? selectContactById(state, contactId) : null));

  const {
    name: contactName,
    thumbnail: contactThumbnail,
    phoneNumber,
    email: contactEmail,
  } = contact || {};

  const email = emailFromConversation || contactEmail;
  const name = nameFromConversation || contactName;
  const thumbnail = thumbnailFromConversation || contactThumbnail;

  const {
    city,
    country,
    description,
    location = '',
    companyName = '',
    socialProfiles,
    twitterScreenName,
    screenName,
    telegramUsername,
    socialTelegramUserName,
  } = contact?.additionalAttributes || {};

  const contactCustomAttributes = useAppSelector(getContactCustomAttributes);

  const usedContactCustomAttributes = processContactAttributes(
    contactCustomAttributes,
    contact?.customAttributes || {},
    (key, custom) => key in custom,
  );

  const hasContactCustomAttributes = usedContactCustomAttributes.length > 0;

  const contactLabels = useAppSelector(state =>
    contactId ? selectContactLabelsByContactId(contactId)(state) : [],
  );

  useEffect(() => {
    if (contactId) {
      dispatch(contactLabelActions.getContactLabels({ contactId }));

      apiService
        .get<{ payload: unknown }>(`contacts/${contactId}`, {
          params: { include_contact_inboxes: true },
        })
        .then(response => {
          dispatch(addContact(transformContact(response.data.payload)));
        })
        .catch(() => {
          // The screen already has conversation contact data; this only enriches Telegram details.
        });
    }
  }, [contactId, dispatch]);

  const isTelegramConversation =
    conversation?.channel === INBOX_TYPES.TELEGRAM ||
    conversation?.meta?.channel === INBOX_TYPES.TELEGRAM;

  const socialMediaProfiles = {
    twitter: twitterScreenName || screenName,
    telegram: telegramUsername || socialTelegramUserName,
    ...(socialProfiles || {}),
  };

  const telegramUsernameValue = sanitizeTelegramUsername(socialMediaProfiles.telegram);
  const telegramLink = telegramUsernameValue
    ? `${TELEGRAM_LINK_PREFIX}${telegramUsernameValue}`
    : '';
  const contactInboxes = contact?.contactInboxes || [];
  const currentContactInbox =
    contactInboxes.find(contactInbox => contactInbox.inbox?.id === conversation?.inboxId) ||
    contactInboxes.find(contactInbox => contactInbox.inbox?.channelType === INBOX_TYPES.TELEGRAM);
  const telegramChatId = isTelegramConversation
    ? currentContactInbox?.sourceId || contact?.identifier || ''
    : '';

  const socialMediaDetails = allSocialMediaProfiles
    .filter(profile => {
      if (profile.key === 'telegram') {
        return false;
      }

      return socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles];
    })
    .map(profile => {
      const profileValue = socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles];
      const profileLink = `${profile.link}${profileValue}`;

      return {
        ...profile,
        link: profileLink,
        subtitle: profileLink,
        type: 'link',
      };
    });

  const telegramDetails: AttributeListType[] = isTelegramConversation
    ? [
        ...(telegramLink
          ? [
              {
                icon: <TelegramFilledIcon />,
                subtitle: 'Open in Telegram',
                title: 'Telegram Chat',
                subtitleType: 'dark' as const,
                key: 'telegram_chat_link',
                link: telegramLink,
                copyValue: telegramLink,
                type: 'link' as const,
              },
            ]
          : []),
        ...(telegramChatId
          ? [
              {
                icon: <TelegramFilledIcon />,
                subtitle: telegramChatId,
                title: 'Telegram Chat ID',
                subtitleType: 'dark' as const,
                key: 'telegram_chat_id',
                copyValue: telegramChatId,
                type: 'text' as const,
              },
            ]
          : []),
      ]
    : [];

  const fullLocation = location || [city, country].filter(Boolean).join(', ') || null;

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

  const allDetails = [...userDetails, ...telegramDetails, ...socialMediaDetails];

  return (
    <BottomSheetModalProvider>
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
          {contactId ? (
            <Animated.View style={tailwind.style('pt-10')}>
              <ContactLabelActions labels={contactLabels} contactId={contactId} />
            </Animated.View>
          ) : null}
        </Animated.ScrollView>
      </View>
    </BottomSheetModalProvider>
  );
};

export default ContactDetailsScreen;
