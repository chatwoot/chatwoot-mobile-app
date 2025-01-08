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
import {
  selectConversationById,
  selectConversationFetching,
  selectConversationError,
} from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';

import { notificationActions } from '@/store/notification/notificationAction';
import { MarkAsReadPayload } from '@/store/notification/notificationTypes';
import { PrimaryActorType } from '@/types/Notification';
import { assignableAgentActions } from '@/store/assignable-agent/assignableAgentActions';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';
import { conversationActions } from '@/store/conversation/conversationActions';
import { TAB_BAR_HEIGHT } from '@/constants';
import { EmptyStateIcon } from '@/svg-icons';
import { Button } from '@/components-next';
import { ActivityIndicator, Pressable } from 'react-native';
import i18n from '@/i18n';
import { StackActions, useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const { conversationId, primaryActorId, primaryActorType } = props.route.params;
  const dispatch = useAppDispatch();

  const conversationFetching = useAppSelector(state => selectConversationFetching(state));
  const conversationError = useAppSelector(state => selectConversationError(state));
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const fetchConversation = () => {
    dispatch(conversationActions.fetchConversation(conversationId));
  };

  useEffect(() => {
    if (!conversation) {
      fetchConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.dispatch(StackActions.pop());
    } else {
      navigation.dispatch(StackActions.replace('Tab'));
    }
  };

  if (conversation) {
    return (
      <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
        <LightBoxProvider>
          <ChatWindowProvider conversationId={conversationId}>
            <ChatScreenWrapper {...props} />
          </ChatWindowProvider>
        </LightBoxProvider>
        <ActionBottomSheet />
      </SafeAreaView>
    );
  }

  if (conversationFetching) {
    return (
      <Animated.View
        style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
        <ActivityIndicator />
      </Animated.View>
    );
  }

  if (conversationError) {
    return (
      <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
        <Animated.View
          style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
          <EmptyStateIcon />
          <Animated.Text
            style={tailwind.style(
              'pt-6 text-base font-inter-420-20 tracking-[0.32px] text-gray-950',
            )}>
            {conversationError || i18n.t('CONVERSATION.NOT_FOUND.TITLE')}
          </Animated.Text>
          <Animated.View style={tailwind.style('px-4 pt-4  w-full')}>
            <Button
              variant="secondary"
              text={i18n.t('CONVERSATION.NOT_FOUND.RETRY')}
              handlePress={fetchConversation}
            />
            <Pressable
              style={tailwind.style('flex-row justify-center items-center mt-6')}
              onPress={handleBackPress}>
              <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
                {i18n.t('CONVERSATION.NOT_FOUND.BACK_TO_HOME')}
              </Animated.Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return null;
};

export default ChatScreen;
