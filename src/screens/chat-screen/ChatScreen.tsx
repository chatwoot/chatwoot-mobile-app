import React, { useEffect } from 'react';
import { View } from 'react-native';
// import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

let PagerViewComponent: any = null;
let isPagerViewAvailable = false;
try {
  PagerViewComponent = require('react-native-pager-view').default;
  isPagerViewAvailable = true;
} catch (e) {
  console.warn('react-native-pager-view not available');
}

// Mock type
type PagerViewOnPageSelectedEvent = any;

import { ChatHeaderContainer } from './components';
import { ConversationActions } from './conversation-actions';

import { ReplyBoxContainer } from './components';
import { MessagesListContainer } from './components';
import { ChatWindowProvider, useChatWindowContext, useRefsContext, useTheme } from '@/context';
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
import { ErrorIcon } from '@/svg-icons';
import { Button } from '@/components-next';
import { ActivityIndicator, Pressable } from 'react-native';
import i18n from '@/i18n';
import { StackActions, useNavigation } from '@react-navigation/native';
import { MacrosList } from './components/macros/MacrosList';
import { macroActions } from '@/store/macro/macroActions';
// import { LightBoxProvider } from '@alantoa/lightbox';

let LightBoxProvider: any = ({ children }: any) => <>{children}</>;
try {
  LightBoxProvider = require('@alantoa/lightbox').LightBoxProvider;
} catch (e) {
  console.warn('@alantoa/lightbox not available');
}

export const ChatWindow = (props: ChatScreenProps) => {
  return (
    <Animated.View style={tailwind.style('flex-1')}>
      <MessagesListContainer />
      <ReplyBoxContainer />
      <MacrosList conversationId={props.route.params.conversationId} />
    </Animated.View>
  );
};

type ChatScreenProps = NativeStackScreenProps<TabBarExcludedScreenParamList, 'ChatScreen'>;

const ConversationPagerView = (props: ChatScreenProps) => {
  const { chatPagerView } = useRefsContext();
  const { setPagerViewIndex, pagerViewIndex } = useChatWindowContext();
  const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setPagerViewIndex(e.nativeEvent.position);
  };

  // When PagerView is not available (Expo Go), show only one view at a time
  if (!isPagerViewAvailable) {
    return (
      <View style={tailwind.style('flex-1')}>
        {pagerViewIndex === 0 ? (
          <ChatWindow {...props} />
        ) : (
          <ConversationActions />
        )}
      </View>
    );
  }

  return (
    <PagerViewComponent
      ref={chatPagerView}
      orientation="horizontal"
      overdrag
      style={tailwind.style('flex-1')}
      scrollEnabled
      initialPage={0}
      onPageSelected={onPageSelected}>
      <ChatWindow {...props} />
      <ConversationActions />
    </PagerViewComponent>
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
      <ChatHeaderContainer name={name || ''} imageSrc={{ uri: thumbnail || '' }} />
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
    dispatch(macroActions.fetchMacros());
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

    // Cleanup on unmount to prevent crashes
    return () => {
      try {
        // Clear any pending operations
        dispatch(resetSentMessage());
      } catch (error) {
        console.error('[ChatScreen] Cleanup error:', error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackPress = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.dispatch(StackActions.replace('Tab'));
      }
    } catch (error) {
      console.error('[ChatScreen] Back navigation error:', error);
      navigation.navigate('Tab' as never);
    }
  };

  const { colors, isDark } = useTheme();

  if (conversation) {
    return (
      <SafeAreaView edges={['top']} style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
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

  if (conversationError || !conversation) {
    return (
      <SafeAreaView edges={['top']} style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
        <Animated.View
          style={tailwind.style(
            'flex-1 items-center justify-center gap-8 px-4',
            `pb-[${TAB_BAR_HEIGHT}px]`,
          )}>
          <ErrorIcon />
          <Animated.View style={tailwind.style('flex items-center justify-center gap-4')}>
            <Animated.Text
              style={tailwind.style(
                'text-2xl font-inter-420-20 text-gray-950 font-inter-semibold-20',
              )}>
              {conversationError || i18n.t('CONVERSATION.NOT_FOUND.TITLE')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'font-inter-normal-20 font-base leading-[18px] tracking-[0.32px] text-gray-950 text-center',
              )}>
              {i18n.t('CONVERSATION.NOT_FOUND.DESCRIPTION')}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('gap-8 w-full')}>
            <Button
              variant="primary"
              text={i18n.t('CONVERSATION.NOT_FOUND.RETRY')}
              handlePress={fetchConversation}
            />
            <Pressable
              style={tailwind.style('flex-row justify-center items-center')}
              onPress={handleBackPress}>
              <Animated.Text style={tailwind.style('text-base font-inter-medium-24 text-gray-900')}>
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
