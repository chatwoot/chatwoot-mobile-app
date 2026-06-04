import React, { useEffect, useState } from 'react';
import { Pressable, View, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import camelCase from 'camelcase';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { TAB_BAR_HEIGHT } from '@/constants';
import {
  CallIcon,
  CaretRight,
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
  ContactNotesTab,
  ContactHistoryTab,
  ContactMergeTab,
  ContactCompanySelectorSheet,
} from './components';
import { AttributeList, Icon, Tabs } from '@/components-next';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactLabelActions } from '@/store/contact/contactLabelActions';
import { getContactCustomAttributes } from '@/store/custom-attribute/customAttributeSlice';
import { selectContactById } from '@/store/contact/contactSelectors';
import { selectContactLabelsByContactId } from '@/store/contact/contactLabelSlice';
import { updateContact } from '@/store/contact/contactSlice';
import { ContactService } from '@/store/contact/contactService';
import { CompanyService } from '@/store/company/companyService';
import type { Contact } from '@/types';
import type { Company } from '@/types/Company';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';

type ContactDetailsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'ContactDetails'
>;

const CONTACT_TABS = [
  { id: 'Attributes', labelKey: 'CONTACT_DETAILS.ATTRIBUTES' },
  { id: 'History', labelKey: 'CONTACT_DETAILS.HISTORY' },
  { id: 'Notes', labelKey: 'CONTACT_DETAILS.NOTES' },
  { id: 'Merge', labelKey: 'CONTACT_DETAILS.MERGE' },
] as const;

type ContactTab = (typeof CONTACT_TABS)[number]['id'];

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

const getDisplayValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
};

const getNumericId = (id: unknown) => {
  if (typeof id === 'number') {
    return id;
  }

  if (typeof id === 'string') {
    const numericId = Number(id);
    return Number.isNaN(numericId) ? null : numericId;
  }

  return null;
};

const mergeContactDetails = (
  routeContact?: Partial<Contact>,
  storeContact?: Contact | null,
): Contact | null => {
  if (!routeContact && !storeContact) {
    return null;
  }

  return {
    ...routeContact,
    ...storeContact,
    id: storeContact?.id || routeContact?.id || 0,
    name: storeContact?.name ?? routeContact?.name ?? null,
    email: storeContact?.email ?? routeContact?.email ?? null,
    phoneNumber: storeContact?.phoneNumber ?? routeContact?.phoneNumber ?? null,
    thumbnail: storeContact?.thumbnail ?? routeContact?.thumbnail ?? null,
    identifier: storeContact?.identifier ?? routeContact?.identifier ?? null,
    type: storeContact?.type ?? routeContact?.type ?? '',
    createdAt: storeContact?.createdAt ?? routeContact?.createdAt ?? 0,
    lastActivityAt: storeContact?.lastActivityAt ?? routeContact?.lastActivityAt ?? null,
    customAttributes: {
      ...(routeContact?.customAttributes || {}),
      ...(storeContact?.customAttributes || {}),
    },
    additionalAttributes: {
      ...(routeContact?.additionalAttributes || {}),
      ...(storeContact?.additionalAttributes || {}),
    },
  } as Contact;
};

const ContactCompanyRow = ({
  companyName,
  onPress,
}: {
  companyName: string;
  onPress: () => void;
}) => {
  const value = companyName || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE');

  return (
    <Animated.View style={tailwind.style('px-4 pt-10')}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) =>
          tailwind.style(
            'flex-row items-center rounded-[13px] bg-white px-3 py-[11px] shadow-sm',
            pressed ? 'bg-gray-100' : '',
          )
        }>
        <Icon icon={<CompanyIcon />} size={24} />
        <Animated.View style={tailwind.style('ml-3 flex-1 flex-row items-center justify-between')}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
            )}>
            {i18n.t('CONTACT_DETAILS.COMPANY')}
          </Animated.Text>
          <Animated.View style={tailwind.style('max-w-[220px] flex-row items-center')}>
            <Animated.Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={tailwind.style(
                'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px]',
                companyName ? 'text-blue-800' : 'text-gray-700',
              )}>
              {value}
            </Animated.Text>
            <Icon icon={<CaretRight />} size={20} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const ContactDetailsScreen = (props: ContactDetailsScreenProps) => {
  const {
    conversationId,
    contactId: routeContactId,
    contact: routeContact,
    company: sourceCompany,
  } = props.route.params;
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<TabBarExcludedScreenParamList>>();
  const [activeTab, setActiveTab] = useState<ContactTab>('Attributes');
  const [isCompanySelectorVisible, setIsCompanySelectorVisible] = useState(false);

  const conversation = useAppSelector(state =>
    conversationId ? selectConversationById(state, conversationId) : null,
  );

  const contactIdFromConversation = conversation?.meta?.sender?.id;
  const contactId = routeContactId || contactIdFromConversation;

  const emailFromConversation = conversation?.meta?.sender?.email;
  const nameFromConversation = conversation?.meta?.sender?.name;
  const thumbnailFromConversation = conversation?.meta?.sender?.thumbnail;

  const storeContact = useAppSelector(state =>
    contactId ? selectContactById(state, contactId) : null,
  );
  const contact = mergeContactDetails(routeContact, storeContact);

  const {
    name: contactName,
    thumbnail: contactThumbnail,
    phoneNumber,
    email: contactEmail,
  } = contact || {};

  const email = emailFromConversation || contactEmail;
  const name = nameFromConversation || contactName;
  const thumbnail = thumbnailFromConversation || contactThumbnail;

  const additionalAttributes = contact?.additionalAttributes || {};
  const {
    city,
    country,
    description,
    location = '',
    socialProfiles,
    twitterScreenName,
    telegramUsername,
  } = additionalAttributes;
  const companyName = getDisplayValue(
    contact?.company?.name ||
      contact?.companyName ||
      additionalAttributes.company?.name ||
      additionalAttributes.companyName ||
      sourceCompany?.name,
  );
  const companyId =
    contact?.company?.id ||
    contact?.companyId ||
    additionalAttributes.company?.id ||
    additionalAttributes.companyId ||
    sourceCompany?.id;
  const numericCompanyId = getNumericId(companyId);
  const role = getDisplayValue(additionalAttributes.role);

  const contactCustomAttributes = useAppSelector(getContactCustomAttributes);

  const usedContactCustomAttributes = processContactAttributes(
    contactCustomAttributes,
    contact?.customAttributes || {},
    () => true,
  );

  const socialMediaProfiles = {
    twitter: twitterScreenName,
    telegram: telegramUsername,
    ...(socialProfiles || {}),
  };

  const hasContactCustomAttributes = usedContactCustomAttributes.length > 0;

  const contactLabels = useAppSelector(state =>
    contactId ? selectContactLabelsByContactId(contactId)(state) : [],
  );

  useEffect(() => {
    if (contactId) {
      dispatch(contactLabelActions.getContactLabels({ contactId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!contactId) {
      return undefined;
    }

    let isMounted = true;
    ContactService.getContact(contactId)
      .then(fullContact => {
        if (isMounted) {
          dispatch(updateContact(fullContact));
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [contactId, dispatch]);

  const socialMediaDetails = allSocialMediaProfiles
    .filter(profile => socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles])
    .map(profile => ({
      ...profile,
      subtitle: `${profile.link}${socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles]}`,
      type: 'link',
    }));

  const fullLocation = location || [city, country].filter(Boolean).join(', ') || null;

  const optionalDetails: GenericListType[] = [
    role
      ? {
          icon: <CompanyIcon />,
          subtitle: role,
          title: 'Role',
          subtitleType: 'dark',
        }
      : null,
    fullLocation
      ? {
          icon: <LocationIcon />,
          subtitle: fullLocation,
          title: 'Location',
          subtitleType: 'dark',
        }
      : null,
  ].filter(Boolean) as GenericListType[];

  const defaultDetails: GenericListType[] = [
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
  ];

  const allDetails = [...optionalDetails, ...defaultDetails, ...socialMediaDetails];
  const headerSubtitle = companyName
    ? `${role ? `${role} - ` : ''}${companyName}`
    : email || phoneNumber || '';
  const tabItems = CONTACT_TABS.map(tab => ({ id: tab.id, label: i18n.t(tab.labelKey) }));
  const handleCompanyPress = () => {
    if (numericCompanyId) {
      navigation.navigate('CompanyDetails', { companyId: numericCompanyId });
      return;
    }

    setIsCompanySelectorVisible(true);
  };

  const handleCompanySelect = async (company: Company) => {
    if (!contactId) {
      return;
    }

    try {
      const updatedContact = await CompanyService.attachContactToCompany(company.id, contactId);
      dispatch(
        updateContact({
          ...updatedContact,
          companyId: updatedContact.companyId || company.id,
          company: updatedContact.company || { id: company.id, name: company.name },
          additionalAttributes: {
            ...(updatedContact.additionalAttributes || {}),
            companyId: updatedContact.companyId || company.id,
            companyName: updatedContact.company?.name || company.name,
          },
        }),
      );
      showToast({ message: i18n.t('CONTACT_DETAILS.COMPANY_UPDATED') });
    } catch {
      showToast({ message: i18n.t('CONTACT_DETAILS.COMPANY_UPDATE_FAILED') });
    }
  };

  return (
    <BottomSheetModalProvider>
      <View
        style={tailwind.style(
          `flex-1 bg-white pt-6 ${Platform.OS === 'android' ? 'pt-12' : 'pt-6'}`,
        )}>
        <ContactDetailsScreenHeader
          name={name || contactName || ''}
          thumbnail={thumbnail || contactThumbnail || ''}
          bio={headerSubtitle || description || ''}
        />
        <Animated.View style={tailwind.style('px-4 pt-4')}>
          <Tabs
            items={tabItems}
            activeTabId={activeTab}
            onTabPress={tabId => setActiveTab(tabId as ContactTab)}
          />
        </Animated.View>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
          {activeTab === 'Attributes' ? (
            <>
              <Animated.View style={tailwind.style('mt-[23px] px-4')}>
                <ContactBasicActions phoneNumber={phoneNumber || ''} email={email || ''} />
              </Animated.View>
              <Animated.View style={tailwind.style('pt-10')}>
                <AttributeList list={allDetails as AttributeListType[]} />
              </Animated.View>
              <ContactCompanyRow companyName={companyName} onPress={handleCompanyPress} />
              {contactId ? (
                <Animated.View style={tailwind.style('pt-10')}>
                  <ContactLabelActions labels={contactLabels} contactId={contactId} />
                </Animated.View>
              ) : null}
              {hasContactCustomAttributes && (
                <Animated.View style={tailwind.style('pt-10')}>
                  <ContactMetaInformation attributes={usedContactCustomAttributes} />
                </Animated.View>
              )}
            </>
          ) : null}
          {activeTab === 'Notes' && contactId ? <ContactNotesTab contactId={contactId} /> : null}
          {activeTab === 'Notes' && !contactId ? (
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-10',
              )}>
              {i18n.t('CONTACT_DETAILS.NOTES_UNAVAILABLE')}
            </Animated.Text>
          ) : null}
          {activeTab === 'History' ? (
            <ContactHistoryTab contactId={contactId} contact={contact || undefined} />
          ) : null}
          {activeTab === 'Merge' ? <ContactMergeTab contact={contact || undefined} /> : null}
        </Animated.ScrollView>
        <ContactCompanySelectorSheet
          visible={isCompanySelectorVisible}
          selectedCompanyId={numericCompanyId || undefined}
          onSelect={handleCompanySelect}
          onClose={() => setIsCompanySelectorVisible(false)}
        />
      </View>
    </BottomSheetModalProvider>
  );
};

export default ContactDetailsScreen;
