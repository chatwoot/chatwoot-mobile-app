import React, { useEffect } from 'react';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import { LightBoxProvider } from '@alantoa/lightbox';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatScreenHeader } from './components';
import { ConversationActions } from './conversation-actions';

import { MessageInputBox } from '@/components-next/chat/MessageInputBox';
import { MessagesList } from '@/components-next/chat/MessagesList';
import { ChatWindowProvider, useChatWindowContext, useRefsContext } from '@/context';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { tailwind } from '@/theme';

export const ChatWindow = () => {
  return (
    <Animated.View style={tailwind.style('flex-1')}>
      <MessagesList />
      <MessageInputBox />
    </Animated.View>
  );
};

type ChatScreenProps = NativeStackScreenProps<TabBarExcludedScreenParamList, 'ChatScreen'>;

const ConversationPagerView = () => {
  const { chatPagerView } = useRefsContext();
  const { setPagerViewIndex } = useChatWindowContext();
  const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setPagerViewIndex(e.nativeEvent.position);
  };
  return (
    <PagerView
      ref={chatPagerView}
      orientation="horizontal"
      overdrag
      style={tailwind.style('flex-1')}
      scrollEnabled
      initialPage={0}
      onPageSelected={onPageSelected}>
      <ChatWindow />
      <ConversationActions />
    </PagerView>
  );
};

const ChatScreenWrapper = () => {
  return (
    <React.Fragment>
      <ChatScreenHeader
        name={'John Jacobs'}
        imageSrc={{
          uri: 'https://staging-chatwoot-assets.s3.amazonaws.com/6pxkq3iagyside8cbjxq2ax3qal8?response-content-disposition=inline%3B%20filename%3D%22IMG_0802%20Copy%20%25281%2529.jpg%22%3B%20filename%2A%3DUTF-8%27%27IMG_0802%2520Copy%2520%25281%2529.jpg&response-content-type=image%2Fjpeg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAX7PDOLKINF2NWSIW%2F20231209%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231209T061806Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=210ab2a48bb0ac5a698543aae718557ad4931e79516d75ba9c504d013954865e',
        }}
      />
      <ConversationPagerView />
    </React.Fragment>
  );
};
const ChatScreen = (_props: ChatScreenProps) => {
  // const chatData = conversationListData[props.route.params.index];
  useEffect(() => {
    const setUpTrackPlayer = () => {
      TrackPlayer.setupPlayer()
        .then(() => {})
        .catch(() => {
          // Handle setting up player error
        });
    };
    setUpTrackPlayer();
  });
  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <LightBoxProvider>
        <ChatWindowProvider>
          <ChatScreenWrapper />
        </ChatWindowProvider>
      </LightBoxProvider>
    </SafeAreaView>
  );
};

export default ChatScreen;
