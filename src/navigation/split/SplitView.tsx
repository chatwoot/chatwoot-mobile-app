import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useWindowDimensions, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '@/screens/chat-screen/ChatScreen';
import ContactDetailsScreen from '@/screens/contact-details/ContactDetailsScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import { ConversationActions } from '@/screens/chat-screen/conversation-actions';
import { MacrosPane } from '@/screens/chat-screen/components/macros/MacrosPane';
import { ReplyBoxContainer } from '@/screens/chat-screen/components/reply-box/ReplyBoxContainer';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';
import { ChatWindowProvider, ContainerWidthContext, RefsProvider } from '@/context';
import { tailwind } from '@/theme';
import { useIsSplitLayout } from '@/utils';
import { useAppSelector } from '@/hooks';
import { selectIsPrivateMessage } from '@/store/conversation/sendMessageSlice';
import i18n from '@/i18n';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import {
  ComposePaneContext,
  ContactPaneContext,
  DashboardColumnParams,
  DetailPaneContext,
  SecondaryColumn,
  SplitViewContext,
  useSplitView,
} from './SplitViewContext';
import { SplitEmptyState } from './SplitEmptyState';
import { ConversationPaneEmptyIcon } from '@/svg-icons';

// List + conversation side by side on wide side-tab layouts (open iPhone Duo), like
// Mail or WhatsApp. On other layouts the list renders alone and rows push the chat
// screen as before.

const PaneStack = createNativeStackNavigator<Pick<TabBarExcludedScreenParamList, 'ChatScreen'>>();

type PaneChatProps = React.ComponentProps<typeof ChatScreen>;

// Reads the conversation from the split view's selection rather than its route params.
// A nested navigator's state is kept by its parent screen, so a remounted pane would
// restore the first conversation it showed and ignore new params. ChatScreen already
// handles its conversation changing (it refetches and resets its content).
const PaneChat = (props: PaneChatProps) => {
  const selectedConversationId = useSplitView()?.selectedConversationId;
  const route = {
    ...props.route,
    params: { ...props.route.params, conversationId: selectedConversationId ?? 0 },
  };
  return <ChatScreen {...props} route={route} />;
};

// The chat runs in its own small stack so ChatScreen keeps its usual route and
// navigation props. Screens it opens (contact details, dashboard apps) are not in this
// stack, so those navigations go up to the app stack as before. Its own RefsProvider keeps
// the chat's sheets and pager separate from the list's.
const ConversationPane = ({ conversationId }: { conversationId: number }) => (
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

const EmptyPane = ({ icon, message }: { icon?: React.ReactElement; message?: string }) => (
  <View style={tailwind.style('flex-1 items-center justify-center')}>
    <SplitEmptyState
      icon={icon ?? <ConversationPaneEmptyIcon />}
      message={message ?? i18n.t('CONVERSATION.SPLIT_VIEW.EMPTY')}
    />
  </View>
);

type SplitViewProps = PropsWithChildren<{
  // When this changes (e.g. the list's filters), the open conversation is closed: the
  // list is refetched and may no longer contain it.
  resetKey?: unknown;
  // What the conversation pane shows before anything is selected.
  emptyIcon?: React.ReactElement;
  emptyMessage?: string;
}>;

// The secondary column: contact details, conversation actions or a dashboard app, reusing
// their screens. It touches the display edge, so it keeps clear of the status bar column.
const SecondaryPane = ({
  column,
  conversationId,
}: {
  column: SecondaryColumn;
  conversationId: number;
}) => {
  const navigation = useNavigation();
  const { right } = useSafeAreaInsets();
  // Actions and contact details use the iOS Settings style: light gray with flat white cards.
  const isPrivateNote = useAppSelector(selectIsPrivateMessage);
  const background =
    column.kind === 'compose'
      ? // Matches the editor, including under the status bar column.
        isPrivateNote
        ? 'bg-amber-50'
        : 'bg-white'
      : column.kind === 'dashboard'
        ? 'bg-white'
        : 'bg-gray-50';

  let content: React.ReactNode = null;
  if (column.kind === 'contact') {
    const route = {
      key: `contact-${conversationId}`,
      name: 'ContactDetails',
      params: { conversationId },
    };
    content = (
      <ContactPaneContext.Provider value={true}>
        {/* Pane styling for its shared lists (flat cards); the column handles the right inset. */}
        <DetailPaneContext.Provider value={true}>
          <ContactDetailsScreen
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ route, navigation } as any)}
          />
        </DetailPaneContext.Provider>
      </ContactPaneContext.Provider>
    );
  } else if (column.kind === 'actions') {
    // The actions need the chat's context and their own sheets, as on the chat's actions page.
    content = (
      <DetailPaneContext.Provider value={true}>
        <RefsProvider>
          <ChatWindowProvider conversationId={conversationId}>
            <ConversationActions />
            <ActionBottomSheet />
          </ChatWindowProvider>
        </RefsProvider>
      </DetailPaneContext.Provider>
    );
  } else if (column.kind === 'macros') {
    content = <MacrosPane conversationId={conversationId} />;
  } else if (column.kind === 'compose') {
    // The reply editor, with the chat's context so the draft (kept in the store) carries over.
    content = (
      <DetailPaneContext.Provider value={true}>
        <ComposePaneContext.Provider value={true}>
          <RefsProvider>
            <ChatWindowProvider conversationId={conversationId}>
              <ReplyBoxContainer />
            </ChatWindowProvider>
          </RefsProvider>
        </ComposePaneContext.Provider>
      </DetailPaneContext.Provider>
    );
  } else {
    content = (
      <DashboardScreen
        paneParams={{
          url: column.url,
          title: column.title,
          conversation: column.conversation,
          currentUser: column.currentUser,
        }}
      />
    );
  }

  return (
    <View style={[tailwind.style('flex-1', background), { paddingRight: right }]}>{content}</View>
  );
};

// Spring for the columns sliding when contact details open or close.
const SLIDE_SPRING = { damping: 26, stiffness: 220, mass: 1 };

export const SplitView = ({ children, resetKey, emptyIcon, emptyMessage }: SplitViewProps) => {
  const isSplit = useIsSplitLayout();
  const { width } = useWindowDimensions();
  const { right: safeRight } = useSafeAreaInsets();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [secondary, setSecondary] = useState<SecondaryColumn | null>(null);
  const isSecondaryOpen = secondary !== null;
  const [totalWidth, setTotalWidth] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      selectedConversationId,
      openConversation: (id: number) => {
        setSecondary(null);
        setSelectedConversationId(id);
      },
      closeConversation: () => {
        setSecondary(null);
        setSelectedConversationId(null);
      },
      secondary,
      isSecondaryOpen,
      openContact: () => setSecondary({ kind: 'contact' }),
      openActions: () => setSecondary({ kind: 'actions' }),
      openMacros: () => setSecondary({ kind: 'macros' }),
      openCompose: () => setSecondary({ kind: 'compose' }),
      openDashboard: (params: DashboardColumnParams) =>
        setSecondary({ kind: 'dashboard', ...params }),
      closeSecondary: () => setSecondary(null),
    }),
    [selectedConversationId, secondary, isSecondaryOpen],
  );

  const resetSignature = JSON.stringify(resetKey ?? null);
  const lastResetSignature = useRef(resetSignature);
  useEffect(() => {
    if (lastResetSignature.current !== resetSignature) {
      lastResetSignature.current = resetSignature;
      setSecondary(null);
      setSelectedConversationId(null);
    }
  }, [resetSignature]);

  // The list takes 40% of the display and the conversation the rest. Opening contact
  // details slides the strip left by the list's width: the conversation narrows to 40% on the
  // left and contact details take the remaining 60% on the right.
  const listWidth = Math.max(320, Math.round(width * 0.4));
  const wideWidth = totalWidth ? totalWidth - listWidth - 1 : null;
  const detailWidth = isSecondaryOpen ? listWidth : wideWidth;
  const contactWidth = isSecondaryOpen ? (wideWidth ?? listWidth) : listWidth;
  const offset = useSharedValue(0);
  useEffect(() => {
    offset.value = withSpring(isSecondaryOpen ? -(listWidth + 1) : 0, SLIDE_SPRING);
  }, [isSecondaryOpen, listWidth, offset]);
  const stripStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  // Swipes on the conversation: left opens actions, right closes the open column. Only clear
  // horizontal drags count, so scrolling the messages isn't affected.
  const swipeOpen = () => {
    if (selectedConversationId && !isSecondaryOpen) setSecondary({ kind: 'actions' });
  };
  const swipeClose = () => {
    if (isSecondaryOpen) setSecondary(null);
  };
  const swipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onEnd(event => {
      const fast = Math.abs(event.velocityX) > 500;
      if (event.translationX < -60 || (fast && event.velocityX < 0)) runOnJS(swipeOpen)();
      else if (event.translationX > 60 || (fast && event.velocityX > 0)) runOnJS(swipeClose)();
    });

  if (!isSplit) return <>{children}</>;

  return (
    <SplitViewContext.Provider value={value}>
      <View
        style={tailwind.style('flex-1 bg-white overflow-hidden')}
        onLayout={e => setTotalWidth(Math.round(e.nativeEvent.layout.width))}>
        <Animated.View style={[tailwind.style('flex-1 flex-row'), stripStyle]}>
          {/* Each pane tells width-based layouts (rows, bubbles, action grids) its own width. */}
          <ContainerWidthContext.Provider value={listWidth}>
            <View style={{ width: listWidth }}>{children}</View>
          </ContainerWidthContext.Provider>
          <View style={tailwind.style('w-[1px] bg-blackA-A3')} />
          <ContainerWidthContext.Provider value={detailWidth}>
            <Animated.View
              // Animate the conversation narrowing/widening along with the slide.
              layout={LinearTransition.springify().damping(26).stiffness(220)}
              style={[
                // Gray only for the empty state; an open conversation sits on white.
                tailwind.style(selectedConversationId ? 'bg-white' : 'bg-gray-50'),
                { width: detailWidth ?? 0 },
              ]}>
              {/* Wait for the pane's width so the chat doesn't first lay out at window width. */}
              {selectedConversationId && detailWidth ? (
                <GestureDetector gesture={swipe}>
                  <View style={tailwind.style('flex-1')}>
                    <ConversationPane conversationId={selectedConversationId} />
                  </View>
                </GestureDetector>
              ) : selectedConversationId ? null : (
                <EmptyPane icon={emptyIcon} message={emptyMessage} />
              )}
            </Animated.View>
          </ContainerWidthContext.Provider>
          <View style={tailwind.style('w-[1px] bg-blackA-A3')} />
          {/* The column pads its right side for the status bar, so its content is narrower. */}
          <ContainerWidthContext.Provider value={contactWidth - safeRight}>
            <View style={{ width: contactWidth }}>
              {secondary && selectedConversationId ? (
                <SecondaryPane column={secondary} conversationId={selectedConversationId} />
              ) : null}
            </View>
          </ContainerWidthContext.Provider>
        </Animated.View>
      </View>
    </SplitViewContext.Provider>
  );
};
