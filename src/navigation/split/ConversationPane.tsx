import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RefsProvider } from '@/context';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { DetailPaneContext } from './SplitViewContext';
import { PaneChat } from './PaneChat';

const PaneStack = createNativeStackNavigator<Pick<TabBarExcludedScreenParamList, 'ChatScreen'>>();

// Own stack keeps ChatScreen route props.
export const ConversationPane = ({ conversationId }: { conversationId: number }) => (
  <DetailPaneContext.Provider value={true}>
    <RefsProvider>
      <PaneStack.Navigator screenOptions={{ headerShown: false }}>
        <PaneStack.Screen
          name="ChatScreen"
          component={PaneChat}
          initialParams={{ conversationId }}
        />
      </PaneStack.Navigator>
    </RefsProvider>
  </DetailPaneContext.Provider>
);
