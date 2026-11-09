import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ContactDetailsScreen from '@/screens/contact-details/ContactDetailsScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import { ConversationActions } from '@/screens/chat-screen/conversation-actions';
import { MacrosPane } from '@/screens/chat-screen/components/macros/MacrosPane';
import { ReplyBoxContainer } from '@/screens/chat-screen/components/reply-box/ReplyBoxContainer';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';
import { ChatWindowProvider, RefsProvider } from '@/context';
import { tailwind } from '@/theme';
import { useAppSelector } from '@/hooks';
import { selectIsPrivateMessage } from '@/store/conversation/sendMessageSlice';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import {
  ComposePaneContext,
  ContactPaneContext,
  DetailPaneContext,
  SecondaryColumn,
} from './SplitViewContext';

export const SecondaryPane = ({
  column,
  conversationId,
}: {
  column: SecondaryColumn;
  conversationId: number;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TabBarExcludedScreenParamList, 'ContactDetails'>>();
  const { right } = useSafeAreaInsets();
  const isPrivateNote = useAppSelector(selectIsPrivateMessage);
  const background =
    column.kind === 'compose'
      ? isPrivateNote
        ? 'bg-amber-50'
        : 'bg-white'
      : column.kind === 'dashboard'
        ? 'bg-white'
        : 'bg-gray-50';

  let content: React.ReactNode = null;
  if (column.kind === 'contact') {
    const route = {
      key: `contact-${conversationId}`,
      name: 'ContactDetails' as const,
      params: { conversationId },
    };
    content = (
      <ContactPaneContext.Provider value={true}>
        <DetailPaneContext.Provider value={true}>
          <ContactDetailsScreen route={route} navigation={navigation} />
        </DetailPaneContext.Provider>
      </ContactPaneContext.Provider>
    );
  } else if (column.kind === 'actions') {
    content = (
      <DetailPaneContext.Provider value={true}>
        <RefsProvider>
          <ChatWindowProvider conversationId={conversationId}>
            <ConversationActions />
            <ActionBottomSheet />
          </ChatWindowProvider>
        </RefsProvider>
      </DetailPaneContext.Provider>
    );
  } else if (column.kind === 'macros') {
    content = <MacrosPane conversationId={conversationId} />;
  } else if (column.kind === 'compose') {
    content = (
      <DetailPaneContext.Provider value={true}>
        <ComposePaneContext.Provider value={true}>
          <RefsProvider>
            <ChatWindowProvider conversationId={conversationId}>
              <ReplyBoxContainer />
            </ChatWindowProvider>
          </RefsProvider>
        </ComposePaneContext.Provider>
      </DetailPaneContext.Provider>
    );
  } else {
    content = (
      <DashboardScreen
        paneParams={{
          url: column.url,
          title: column.title,
          conversation: column.conversation,
          currentUser: column.currentUser,
        }}
      />
    );
  }

  return (
    <View style={[tailwind.style('flex-1', background), { paddingRight: right }]}>{content}</View>
  );
};
