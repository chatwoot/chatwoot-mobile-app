import React, { useEffect } from 'react';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import { LightBoxProvider } from '@alantoa/lightbox';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatHeaderContainer } from './components';
// import { ConversationActions } from './conversation-actions';

import { ReplyBoxContainer } from './components';
import { MessagesListContainer } from './components';
import { ChatWindowProvider, useChatWindowContext, useRefsContext } from '@/context';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { tailwind } from '@/theme';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppSelector } from '@/hooks';
export const ChatWindow = (props: ChatScreenProps) => {
  return (
    <Animated.View style={tailwind.style('flex-1')}>
      <MessagesListContainer />
      <ReplyBoxContainer />
    </Animated.View>
  );
};

type ChatScreenProps = NativeStackScreenProps<TabBarExcludedScreenParamList, 'ChatScreen'>;

const ConversationPagerView = (props: ChatScreenProps) => {
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
      <ChatWindow {...props} />
      {/* <ConversationActions /> */}
    </PagerView>
  );
};

const ChatScreenWrapper = (props: ChatScreenProps) => {
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const { meta: { sender: { name = '', thumbnail = '' } = {} } = {} } = conversation || {};

  return (
    <React.Fragment>
      <ChatHeaderContainer
        name={name || ''}
        imageSrc={{
          uri: thumbnail || '',
        }}
      />
      <ConversationPagerView {...props} />
    </React.Fragment>
  );
};
const ChatScreen = (props: ChatScreenProps) => {
  const { conversationId } = props.route.params;

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
        <ChatWindowProvider conversationId={conversationId}>
          <ChatScreenWrapper {...props} />
        </ChatWindowProvider>
      </LightBoxProvider>
    </SafeAreaView>
  );
};

export default ChatScreen;
