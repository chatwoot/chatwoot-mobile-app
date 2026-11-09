import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RefsProvider } from '@/context';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { DetailPaneContext } from './SplitViewContext';
import { PaneChat } from './PaneChat';

const PaneStack = createNativeStackNavigator<Pick<TabBarExcludedScreenParamList, 'ChatScreen'>>();

// The chat runs in its own small stack so ChatScreen keeps its usual route and
// navigation props. Screens it opens (contact details, dashboard apps) are not in this
// stack, so those navigations go up to the app stack. Its own RefsProvider keeps the
// chat's sheets and pager separate from the list's.
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
