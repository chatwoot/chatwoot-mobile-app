import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatWindowProvider, RefsProvider } from '@/context';
import i18n from '@/i18n';
import { FullScreenPage, PageHeader } from '@/navigation/split/FullScreenPage';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';

import { ConversationActions } from './conversation-actions';

type ConversationActionsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'ConversationActionsScreen'
>;

// Conversation actions as their own page on iPhone and the closed Duo (a column on the open
// Duo), pushed from the chat. The chat no longer swipes sideways to them, so the swipe-back
// gesture always returns to the list.
const ConversationActionsScreen = ({ route, navigation }: ConversationActionsScreenProps) => (
  <FullScreenPage background="bg-gray-50">
    <PageHeader title={i18n.t('CONVERSATION_ACTION.TITLE')} onBack={navigation.goBack} />
    <RefsProvider>
      <ChatWindowProvider conversationId={route.params.conversationId}>
        <ConversationActions />
        <ActionBottomSheet />
      </ChatWindowProvider>
    </RefsProvider>
  </FullScreenPage>
);

export default ConversationActionsScreen;
