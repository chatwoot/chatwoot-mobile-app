import React, { useEffect } from 'react';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import { LightBoxProvider } from '@alantoa/lightbox';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatHeaderContainer } from './components';
import { ConversationActions } from './conversation-actions';

import { ReplyBoxContainer } from './components';
import { MessagesListContainer } from './components';
import { ChatWindowProvider, useChatWindowContext, useRefsContext } from '@/context';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { tailwind } from '@/theme';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';

import { notificationActions } from '@/store/notification/notificationAction';
import { MarkAsReadPayload } from '@/store/notification/notificationTypes';
import { PrimaryActorType } from '@/types/Notification';
import { assignableAgentActions } from '@/store/assignable-agent/assignableAgentActions';

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
      <ConversationActions />
    </PagerView>
  );
};

const ChatScreenWrapper = (props: ChatScreenProps) => {
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const { meta: { sender: { name = '', thumbnail = '' } = {} } = {} } = conversation || {};
  const { inboxId } = conversation || {};

  useEffect(() => {
    const inboxIds = inboxId ? [inboxId] : [];
    if (inboxIds.length > 0) {
      dispatch(assignableAgentActions.fetchAgents({ inboxIds }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxId]);

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
  const { conversationId, primaryActorId, primaryActorType } = props.route.params;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (primaryActorId && primaryActorType) {
      const payload: MarkAsReadPayload = {
        primaryActorId,
        primaryActorType: primaryActorType as PrimaryActorType,
      };
      dispatch(notificationActions.markAsRead(payload));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
