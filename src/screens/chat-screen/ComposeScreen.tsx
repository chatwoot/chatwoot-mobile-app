import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatWindowProvider, RefsProvider } from '@/context';
import { useAppSelector } from '@/hooks';
import { ComposePaneContext } from '@/navigation/split/SplitViewContext';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { selectIsPrivateMessage } from '@/store/conversation/sendMessageSlice';

import { ReplyBoxContainer } from './components/reply-box/ReplyBoxContainer';

type ComposeScreenProps = NativeStackScreenProps<TabBarExcludedScreenParamList, 'ComposeScreen'>;

// Full reply editor on iPhone and the closed Duo (on the open Duo it opens in the side column).
// Close to read the thread again; the draft is kept in the store, so it's all there when you
// expand again.
const ComposeScreen = ({ route }: ComposeScreenProps) => {
  const tailwind = useTailwind();
  const isPrivate = useAppSelector(selectIsPrivateMessage);
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={tailwind.style('flex-1', isPrivate ? 'bg-amber-50' : 'bg-white')}>
      <ComposePaneContext.Provider value={true}>
        <RefsProvider>
          <ChatWindowProvider conversationId={route.params.conversationId}>
            <ReplyBoxContainer />
          </ChatWindowProvider>
        </RefsProvider>
      </ComposePaneContext.Provider>
    </SafeAreaView>
  );
};

export default ComposeScreen;
