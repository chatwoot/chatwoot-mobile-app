import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatWindowProvider, RefsProvider } from '@/context';
import i18n from '@/i18n';
import { FullScreenPage } from '@/navigation/split/FullScreenPage';
import { PageHeader } from '@/navigation/split/PageHeader';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';

import { ConversationActions } from './conversation-actions';

type ConversationActionsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'ConversationActionsScreen'
>;

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
