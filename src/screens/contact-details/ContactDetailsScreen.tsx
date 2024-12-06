import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GenericList } from '@/components-next';
import { TAB_BAR_HEIGHT } from '@/constants';
import { CallIcon, EmailIcon, LocationIcon, WebsiteIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { GenericListType } from '@/types';

import { ContactDetailsScreenHeader, ContactBasicActions } from './components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactLabelActions } from '@/store/contact/contactLabelActions';

type ContactDetailsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'ContactDetails'
>;

const ContactDetailsScreen = (props: ContactDetailsScreenProps) => {
  const { conversationId } = props.route.params;
  const dispatch = useAppDispatch();

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const {
    meta: {
      sender: { email, name, thumbnail, id: contactId, phoneNumber, additionalAttributes },
    },
  } = conversation || { meta: { sender: { name: '', thumbnail: '' } } };

  const { city, country } = additionalAttributes || {};

  const { location = '', companyName = '' } = additionalAttributes || {};

  // const contactLabels = useAppSelector(state =>
  //   contactId ? selectContactLabelsByContactId(contactId)(state) : [],
  // );
  useEffect(() => {
    if (contactId) {
      dispatch(contactLabelActions.getContactLabels({ contactId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fullLocation =
    location || city || country !== undefined
      ? location || `${city}${city ? ',' : ''} ${country}`
      : null;

  const userDetails: GenericListType[] = [
    {
      icon: <LocationIcon />,
      subtitle: fullLocation || '',
      title: 'Location',
      subtitleType: 'dark',
    },
    {
      icon: <CallIcon />,
      subtitle: phoneNumber || '',
      title: 'Phone',
      subtitleType: 'dark',
    },
    {
      icon: <EmailIcon />,
      subtitle: email || '',
      title: 'Email',
      subtitleType: 'dark',
    },
    {
      icon: <WebsiteIcon />,
      subtitle: companyName || '',
      title: 'Company',
      subtitleType: 'dark',
    },
  ];

  return (
    <View style={tailwind.style('flex-1 bg-white pt-6')}>
      <ContactDetailsScreenHeader name={name || ''} thumbnail={thumbnail || ''} />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
        <ContactBasicActions phoneNumber={phoneNumber || ''} email={email || ''} />
        <Animated.View style={tailwind.style('pt-10')}>
          <GenericList list={userDetails} />
        </Animated.View>
        {/* <Animated.View style={tailwind.style('pt-10')}>
          <LabelSection labelList={labels} />
        </Animated.View> */}
        {/* <Animated.View style={tailwind.style('pt-10')}>
          <PreviousConversationList />
        </Animated.View> */}
        {/* <Animated.View style={tailwind.style('pt-10')}>
          <OtherConversationDetails />
        </Animated.View> */}
        {/* <Animated.View style={tailwind.style('pt-10')}>
          <FullWidthButton isDestructive text="Delete contact" />
        </Animated.View> */}
      </Animated.ScrollView>
    </View>
  );
};

export default ContactDetailsScreen;
