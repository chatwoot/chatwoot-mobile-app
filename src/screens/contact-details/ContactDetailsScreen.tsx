import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  //   FullWidthButton,
  GenericList,
  //   LabelSection,
  //   OtherConversationDetails,
  //   PreviousConversationList,
} from '@/components-next';
import { TAB_BAR_HEIGHT } from '@/constants';
import { FacebookIcon, LocationIcon, WebsiteIcon, WhatsAppIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { GenericListType, LabelType } from '@/types';

import { ContactDetailsScreenHeader, ContactBasicActions } from './components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactLabelActions } from '@/store/contact/contactLabelActions';
import { selectContactLabels } from '@/store/contact/contactLabelSlice';

const userDetails: GenericListType[] = [
  {
    icon: <LocationIcon />,
    subtitle: 'Chennai, India',
    title: 'Location',
    subtitleType: 'dark',
  },
  {
    icon: <WhatsAppIcon />,
    subtitle: '+91 95290 12950',
    title: 'Phone',
    subtitleType: 'dark',
  },
  {
    icon: <FacebookIcon />,
    subtitle: 'jacobjones@gmail.com',
    title: 'Email',
    subtitleType: 'dark',
  },
  {
    icon: <WebsiteIcon />,
    subtitle: 'jacobjones.co',
    title: 'Website',
    subtitleType: 'dark',
  },
];

const labels: LabelType[] = [
  {
    labelColor: 'bg-yellow-800',
    labelText: 'Premium',
  },
  {
    labelColor: 'bg-pink-800',
    labelText: 'Subscriber',
  },
  {
    labelColor: 'bg-green-800',
    labelText: 'Lead',
  },
  {
    labelColor: 'bg-blue-800',
    labelText: 'New',
  },
  {
    labelColor: 'bg-red-800',
    labelText: 'Unsubscribed',
  },
];

type ContactDetailsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'ContactDetails'
>;

const ContactDetailsScreen = (props: ContactDetailsScreenProps) => {
  const { conversationId } = props.route.params;
  const dispatch = useAppDispatch();

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const contactLabels = useAppSelector(state => selectContactLabels(state));

  const {
    meta: {
      sender: { name, thumbnail, id: contactId },
    },
  } = conversation || { meta: { sender: { name: '', thumbnail: '' } } };

  useEffect(() => {
    if (contactId) {
      dispatch(contactLabelActions.getContactLabels({ contactId }));
      // dispatch(contactConversationActions.getContactConversations({ contactId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={tailwind.style('flex-1 bg-white pt-6')}>
      <ContactDetailsScreenHeader name={name || ''} thumbnail={thumbnail || ''} />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
        <ContactBasicActions />
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
