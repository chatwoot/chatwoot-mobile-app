import React, { useEffect } from 'react';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { selectCurrentUserAccountId } from '@/store/auth/authSelectors';

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
import { WhatsAppTemplatesList } from './components/whatsapp-templates';
import { macroActions } from '@/store/macro/macroActions';
import { useIsInDetailPane, useSplitView } from '@/navigation/split/SplitViewContext';
import { IOS_DESIGN, useSideTabBarLayout } from '@/utils';
import { SideToolbarProvider } from '@/context';
import { SideToolbarSlot } from '@/navigation/tabs/BottomTabBar';

export const ChatWindow = (props: ChatScreenProps) => {
  return (
    <Animated.View style={tailwind.style('flex-1')}>
      <MessagesListContainer />
      <ReplyBoxContainer />
      <MacrosList conversationId={props.route.params.conversationId} />
      <WhatsAppTemplatesList conversationId={props.route.params.conversationId} />
    </Animated.View>
  );
};

type ChatScreenProps = NativeStackScreenProps<TabBarExcludedScreenParamList, 'ChatScreen'>;

const ConversationPagerView = (props: ChatScreenProps) => {
  const isInDetailPane = useIsInDetailPane();
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
      // In the split view pane actions open as a column instead of a swipe-left page.
      scrollEnabled={!isInDetailPane}
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
      <ChatHeaderContainer name={name || ''} imageSrc={{ uri: thumbnail || '' }} />
      <ConversationPagerView {...props} />
    </React.Fragment>
  );
};
// Error state for the split view's conversation pane: compact and quiet, in the same
// type scale as the chat (17pt title, 15pt body, rounded button) instead of the
// full-screen phone layout.
const PaneErrorState = ({
  title,
  onRetry,
  onClose,
}: {
  title: string;
  onRetry: () => void;
  onClose: () => void;
}) => (
  <Animated.View style={tailwind.style('flex-1 bg-gray-50 items-center justify-center px-8')}>
    <Animated.View style={tailwind.style('items-center gap-3 max-w-[320px]')}>
      <Animated.View style={tailwind.style('h-10 w-10 items-center justify-center')}>
        <Animated.View style={{ transform: [{ scale: 0.5 }] }}>
          <ErrorIcon />
        </Animated.View>
      </Animated.View>
      <Animated.Text
        style={tailwind.style(
          'text-[17px] leading-[22px] font-inter-semibold-20 text-gray-950 text-center',
        )}>
        {title}
      </Animated.Text>
      <Animated.Text
        style={tailwind.style(
          'text-[15px] leading-[20px] font-inter-normal-20 text-gray-700 text-center',
        )}>
        {i18n.t('CONVERSATION.NOT_FOUND.PANE_DESCRIPTION')}
      </Animated.Text>
      <Animated.View style={tailwind.style('flex-row items-center gap-2 mt-2')}>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) =>
            tailwind.style(
              'h-9 min-w-[88px] px-5 rounded-full items-center justify-center border border-blue-800 bg-blue-800',
              pressed && 'opacity-80',
            )
          }>
          <Animated.Text style={tailwind.style('text-[15px] font-inter-medium-24 text-white')}>
            {i18n.t('CONVERSATION.NOT_FOUND.RETRY')}
          </Animated.Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          style={({ pressed }) =>
            tailwind.style(
              'h-9 min-w-[88px] px-5 rounded-full items-center justify-center border border-gray-300 bg-white',
              pressed && 'opacity-80',
            )
          }>
          <Animated.Text style={tailwind.style('text-[15px] font-inter-medium-24 text-gray-950')}>
            {i18n.t('CONVERSATION.NOT_FOUND.CLOSE')}
          </Animated.Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  </Animated.View>
);

const ChatScreen = (props: ChatScreenProps) => {
  const navigation = useNavigation();
  const isInDetailPane = useIsInDetailPane();
  const splitView = useSplitView();
  const sideTabBar = useSideTabBarLayout();
  const paneTopMargin = sideTabBar?.contentTopPadding ?? 0;
  const { conversationId, primaryActorId, primaryActorType } = props.route.params;
  const dispatch = useAppDispatch();

  const conversationFetching = useAppSelector(state => selectConversationFetching(state));
  const conversationError = useAppSelector(state => selectConversationError(state));
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const accountId = useAppSelector(selectCurrentUserAccountId);

  const fetchConversation = () => {
    dispatch(conversationActions.fetchConversation(conversationId));
  };

  // Refetch when the conversation or account changes, since a push can reuse this
  // screen with new params instead of remounting.
  useEffect(() => {
    if (!conversation) {
      fetchConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, accountId]);

  useEffect(() => {
    dispatch(macroActions.fetchMacros());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  useEffect(() => {
    if (primaryActorId && primaryActorType) {
      const payload: MarkAsReadPayload = {
        primaryActorId,
        primaryActorType: primaryActorType as PrimaryActorType,
      };
      dispatch(notificationActions.markAsRead(payload));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryActorId, primaryActorType]);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.dispatch(StackActions.pop());
    } else {
      navigation.dispatch(StackActions.replace('Tab'));
    }
  };

  if (conversation) {
    const { messageId } = props.route.params;
    const screen = (
      <SafeAreaView
        // In the split view pane the chat runs to the display edge; its parts pad their content.
        edges={isInDetailPane ? ['top'] : ['top', 'left', 'right']}
        style={tailwind.style('flex-1 bg-white')}>
        {/* With tabs on the side (split view pane or full screen), match the list header's top
            margin so the headers line up and stay out of the rounded corner. */}
        {isInDetailPane || sideTabBar ? <Animated.View style={{ height: paneTopMargin }} /> : null}
        {/* Remount the chat subtree when the conversation or account changes so its
            account-scoped data (agents, teams, participants, canned responses) refetches. */}
        <ChatWindowProvider
          key={`${accountId}-${conversationId}`}
          conversationId={conversationId}
          messageId={messageId}>
          <ChatScreenWrapper {...props} />
        </ChatWindowProvider>
        <ActionBottomSheet />
      </SafeAreaView>
    );
    // Full screen with tabs on the side (e.g. opened from a notification): the tab bar isn't
    // shown, so the chat draws its own side toolbar for its header actions.
    if (!isInDetailPane && sideTabBar) {
      return (
        <SideToolbarProvider>
          <Animated.View style={tailwind.style('flex-1')}>
            {screen}
            <SideToolbarSlot />
          </Animated.View>
        </SideToolbarProvider>
      );
    }
    return screen;
  }

  if (conversationFetching) {
    return (
      <Animated.View
        style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
        <ActivityIndicator />
      </Animated.View>
    );
  }

  if ((conversationError || !conversation) && isInDetailPane) {
    return (
      <PaneErrorState
        title={conversationError || i18n.t('CONVERSATION.NOT_FOUND.TITLE')}
        onRetry={fetchConversation}
        onClose={() => splitView?.closeConversation()}
      />
    );
  }

  if ((conversationError || !conversation) && IOS_DESIGN) {
    // iOS: the same compact error state as the split view pane; Close goes back.
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={tailwind.style('flex-1 bg-gray-50')}>
        <PaneErrorState
          title={conversationError || i18n.t('CONVERSATION.NOT_FOUND.TITLE')}
          onRetry={fetchConversation}
          onClose={handleBackPress}
        />
      </SafeAreaView>
    );
  }

  if (conversationError || !conversation) {
    return (
      <SafeAreaView
        // In the split view pane the chat runs to the display edge; its parts pad their content.
        edges={isInDetailPane ? ['top'] : ['top', 'left', 'right']}
        style={tailwind.style('flex-1 bg-white')}>
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
