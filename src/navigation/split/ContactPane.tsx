import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ContactDetailsScreen from '@/screens/contact-details/ContactDetailsScreen';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { ContactPaneContext, DetailPaneContext } from './SplitViewContext';

export const ContactPane = ({
  conversationId,
  contactId,
  routeKey,
}: {
  conversationId: number;
  contactId?: number;
  routeKey: string;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TabBarExcludedScreenParamList, 'ContactDetails'>>();
  const route = {
    key: routeKey,
    name: 'ContactDetails' as const,
    params: { conversationId, contactId },
  };
  return (
    <ContactPaneContext.Provider value={true}>
      <DetailPaneContext.Provider value={true}>
        <ContactDetailsScreen route={route} navigation={navigation} />
      </DetailPaneContext.Provider>
    </ContactPaneContext.Provider>
  );
};
