import { useTailwind } from '@/theme/useTailwind';
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { takeSplitHandoff, useSplitHandoffSignal } from './splitHandoff';
import { ColumnOpenStoreContext, createColumnOpenStore } from './columnOpenStore';

import { InteractionManager, useWindowDimensions, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '@/screens/chat-screen/ChatScreen';
import ContactDetailsScreen from '@/screens/contact-details/ContactDetailsScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import { ConversationActions } from '@/screens/chat-screen/conversation-actions';
import { MacrosPane } from '@/screens/chat-screen/components/macros/MacrosPane';
import { ReplyBoxContainer } from '@/screens/chat-screen/components/reply-box/ReplyBoxContainer';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';
import { ChatWindowProvider, ContainerWidthContext, RefsProvider } from '@/context';
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

const EmptyPane = ({ icon, message }: { icon?: React.ReactElement; message?: string }) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style('flex-1 items-center justify-center')}>
      <SplitEmptyState
        icon={icon ?? <ConversationPaneEmptyIcon />}
        message={message ?? i18n.t('CONVERSATION.SPLIT_VIEW.EMPTY')}
      />
    </View>
  );
};

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
  const tailwind = useTailwind();
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

const WARM_ACTIONS_COLUMN: SecondaryColumn = { kind: 'actions' };
// The side column hides when the strip is this close to rest (points).
const COLUMN_HIDE_DISTANCE = 24;

// Spring for the columns sliding when contact details open or close.
const SLIDE_SPRING = {
  damping: 26,
  stiffness: 220,
  mass: 1,
  overshootClamping: true,
  restDisplacementThreshold: 0.5,
  restSpeedThreshold: 2,
};

export const SplitView = ({ children, resetKey, emptyIcon, emptyMessage }: SplitViewProps) => {
  const tailwind = useTailwind();
  const isSplit = useIsSplitLayout();
  const { width } = useWindowDimensions();
  const { right: safeRight } = useSafeAreaInsets();
  const listWidth = Math.max(320, Math.round(width * 0.4));
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [secondary, setSecondary] = useState<SecondaryColumn | null>(null);
  // While a swipe is opening a column, it's shown (and laid out as open) but not committed
  // until the finger lifts past the threshold.
  const [isPreviewing, setPreviewing] = useState(false);
  const isColumnShown = secondary !== null;
  // Tells the side toolbar the moment a column starts opening or closing.
  const columnOpenStore = useRef(createColumnOpenStore()).current;
  // Build the actions column shortly after a conversation opens, while nothing else is going on.
  const [isActionsWarm, setActionsWarm] = useState(false);
  useEffect(() => {
    setActionsWarm(false);
    if (!selectedConversationId) return;
    const task = InteractionManager.runAfterInteractions(() => setActionsWarm(true));
    return () => task.cancel();
  }, [selectedConversationId]);
  const isSecondaryOpen = isColumnShown && !isPreviewing;
  const [totalWidth, setTotalWidth] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      selectedConversationId,
      openConversation: (id: number) => {
        setPreviewing(false);
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
      // The pre-built actions column slides in first and is marked open when it lands.
      openActions: () => {
        columnOpenStore.set(true);
        if (isActionsWarm && !secondary) {
          generationSV.value += 1;
          const generation = generationSV.value;
          offset.value = withSpring(-(listWidth + 1), SLIDE_SPRING, finished => {
            if (finished) runOnJS(settleColumn)(true, generation);
          });
        } else {
          setSecondary({ kind: 'actions' });
        }
      },
      openMacros: () => setSecondary({ kind: 'macros' }),
      openCompose: () => setSecondary({ kind: 'compose' }),
      openDashboard: (params: DashboardColumnParams) =>
        setSecondary({ kind: 'dashboard', ...params }),
      // Slide back first and clear the column when it's out of view, so its content doesn't
      // change (or re-render) mid-slide.
      closeSecondary: () => {
        columnOpenStore.set(false);
        generationSV.value += 1;
        const generation = generationSV.value;
        offset.value = withSpring(0, SLIDE_SPRING, finished => {
          if (finished) runOnJS(settleColumn)(false, generation);
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedConversationId, secondary, isSecondaryOpen, isActionsWarm, listWidth],
  );

  // Folding the Duo collapses the split view: keep the open conversation on screen by pushing
  // it full screen (like iPad apps), and close any side column.
  const listNavigation = useNavigation();
  const wasSplit = useRef(isSplit);
  useEffect(() => {
    if (wasSplit.current && !isSplit) {
      if (selectedConversationId) {
        listNavigation.dispatch(
          // No slide: the window is already resizing as the Duo folds.
          StackActions.push('ChatScreen', {
            conversationId: selectedConversationId,
            instant: true,
          }),
        );
      }
      setPreviewing(false);
      setSecondary(null);
      setSelectedConversationId(null);
    }
    wasSplit.current = isSplit;
  }, [isSplit, selectedConversationId, listNavigation]);

  // Unfolding with a chat open full screen: that chat hands its conversation over, and the
  // focused list opens it here so the list shows on the left.
  const handoffSignal = useSplitHandoffSignal();
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isSplit || !isFocused) return;
    const id = takeSplitHandoff();
    if (id) {
      setSecondary(null);
      setSelectedConversationId(id);
    }
  }, [isSplit, isFocused, handoffSignal]);

  const resetSignature = JSON.stringify(resetKey ?? null);
  const lastResetSignature = useRef(resetSignature);
  useEffect(() => {
    if (lastResetSignature.current !== resetSignature) {
      lastResetSignature.current = resetSignature;
      setSecondary(null);
      setSelectedConversationId(null);
    }
  }, [resetSignature]);

  // The list takes 40% of the display and the conversation the rest, short of the status bar
  // column on the right. A side column (contact, actions, …) is the list's width plus that
  // status column: opening it slides the strip left by the list's width, so the conversation
  // moves over at the same width and the column fills the rest up to the display edge (padding
  // itself for the status bar). Widths never change, so the slide (and the swipe that drives
  // it) only moves things; messages never re-wrap mid-animation.
  const wideWidth = totalWidth ? totalWidth - listWidth - 1 : null;
  const detailWidth = wideWidth !== null ? wideWidth - safeRight : null;
  const contactWidth = listWidth + safeRight;
  const openOffset = -(listWidth + 1);
  const offset = useSharedValue(0);
  // Settles the strip when the column opens or closes, unless a swipe is driving it.
  useEffect(() => {
    if (isPreviewing) return;
    offset.value = withSpring(isSecondaryOpen ? openOffset : 0, SLIDE_SPRING);
  }, [isSecondaryOpen, isPreviewing, openOffset, offset]);
  const stripStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));
  const generationSV = useSharedValue(0);
  // After a slide lands: record the column as open (the pre-built actions if none was set) or
  // clear it, unless a newer slide or swipe has started since.
  const settleColumn = (open: boolean, generation: number) => {
    if (generation !== generationSV.value) return;
    setPreviewing(false);
    setSecondary(current => (open ? (current ?? { kind: 'actions' }) : null));
  };
  // The column shows whenever the strip has moved off its resting place and hides once it's
  // back, all on the UI thread: it never lingers (or appears late) waiting for a state update.
  // Hidden once only its last sliver would show, so it's gone as the slide lands rather than
  // on the spring's final pixel.
  const columnStyle = useAnimatedStyle(() => ({
    opacity: offset.value < -COLUMN_HIDE_DISTANCE ? 1 : 0,
  }));
  const restColor = tailwind.color(selectedConversationId ? 'bg-white' : 'bg-gray-50') as string;
  const lineColor = tailwind.color('bg-blackA-A3') as string;
  const dividerStyle = useAnimatedStyle(
    () => ({ backgroundColor: offset.value < -COLUMN_HIDE_DISTANCE ? lineColor : restColor }),
    [restColor, lineColor],
  );

  // Interactive swipes on the conversation: the strip follows the finger from wherever it is
  // (a swipe interrupts any slide still running), and on release it settles open or closed by
  // position and speed. Each swipe or button slide gets a new generation; the state update that
  // follows a slide is skipped if a newer one started meanwhile, so a late update can't yank the
  // strip back. Only clear horizontal drags count, so scrolling the messages isn't affected.
  const isPreviewSV = useSharedValue(0);
  const startOffsetSV = useSharedValue(0);
  // 1 when the pre-built actions column (or an open column) can be dragged without mounting.
  const canDragSV = useSharedValue(0);
  useEffect(() => {
    canDragSV.value = (isActionsWarm || !!secondary) && !!selectedConversationId ? 1 : 0;
  }, [isActionsWarm, secondary, selectedConversationId, canDragSV]);
  const markColumnOpen = (open: boolean) => columnOpenStore.set(open);
  // Keep the signal in step with the settled state (columns opened from buttons, resets).
  useEffect(() => {
    if (!isPreviewing) columnOpenStore.set(isSecondaryOpen);
  }, [isSecondaryOpen, isPreviewing, columnOpenStore]);
  // Mounts the actions column when a swipe starts before it was pre-built.
  const beginPreview = () => {
    if (!selectedConversationId || secondary) return;
    setPreviewing(true);
    setSecondary({ kind: 'actions' });
  };
  const swipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onStart(() => {
      cancelAnimation(offset);
      generationSV.value += 1;
      startOffsetSV.value = offset.value;
    })
    .onUpdate(event => {
      const next = Math.min(0, Math.max(openOffset, startOffsetSV.value + event.translationX));
      if (next < -0.5 && canDragSV.value === 0 && isPreviewSV.value === 0) {
        isPreviewSV.value = 1;
        runOnJS(beginPreview)();
      }
      offset.value = next;
    })
    .onEnd(event => {
      isPreviewSV.value = 0;
      const vx = event.velocityX;
      const startedOpen = startOffsetSV.value < openOffset / 2;
      // Past a third of the way (from where it started) or a flick completes the move.
      const goOpen = startedOpen
        ? !(vx > 500 || (vx > -500 && offset.value > (openOffset * 2) / 3))
        : vx < -500 || (vx < 500 && offset.value < openOffset / 3);
      const generation = generationSV.value;
      runOnJS(markColumnOpen)(goOpen);
      offset.value = withSpring(goOpen ? openOffset : 0, SLIDE_SPRING, finished => {
        if (finished) runOnJS(settleColumn)(goOpen, generation);
      });
    });

  // The list keeps the same place in the tree whether or not the split view is showing, so
  // folding or unfolding the Duo resizes it instead of remounting it (no refetch, scroll kept).
  // Without the split view there's no context, so rows push the chat screen as before.
  return (
    <SplitViewContext.Provider value={isSplit ? value : null}>
      <ColumnOpenStoreContext.Provider value={isSplit ? columnOpenStore : null}>
        <View
          style={tailwind.style('flex-1 bg-white overflow-hidden')}
          onLayout={e => setTotalWidth(Math.round(e.nativeEvent.layout.width))}>
          <Animated.View style={[tailwind.style('flex-1 flex-row'), isSplit ? stripStyle : null]}>
            {/* Each pane tells width-based layouts (rows, bubbles, action grids) its own width. */}
            <ContainerWidthContext.Provider value={isSplit ? listWidth : null}>
              <View style={isSplit ? { width: listWidth } : tailwind.style('flex-1')}>
                {children}
              </View>
            </ContainerWidthContext.Provider>
            {isSplit ? (
              <>
                <View style={tailwind.style('w-[1px] bg-blackA-A3')} />
                <ContainerWidthContext.Provider value={detailWidth}>
                  <Animated.View
                    // The width changes in one step (hidden by the slide) instead of animating:
                    // animating it re-lays out the whole chat every frame and drops frames.
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
                {/* No line next to the empty status bar area when no column is open; it appears as soon
                    as the column starts sliding in (UI thread, not after the slide). */}
                <Animated.View style={[tailwind.style('w-[1px]'), dividerStyle]} />
                {/* The column pads its right side for the status bar, so its content is narrower.
                  With no column open, only its status bar part shows: match the pane behind. */}
                <ContainerWidthContext.Provider value={contactWidth - safeRight}>
                  <View
                    style={[
                      { width: contactWidth },
                      // Matches the pane next to it; an open column covers it with its own page.
                      tailwind.style(selectedConversationId ? 'bg-white' : 'bg-gray-50'),
                    ]}>
                    {/* The actions column is built ahead (hidden) so a swipe can slide it in at
                      once; building it at the start of the swipe stalled the slide. */}
                    {selectedConversationId && (secondary || isActionsWarm) ? (
                      <Animated.View
                        style={[tailwind.style('flex-1'), columnStyle]}
                        pointerEvents={isColumnShown ? 'auto' : 'none'}>
                        <SecondaryPane
                          column={secondary ?? WARM_ACTIONS_COLUMN}
                          conversationId={selectedConversationId}
                        />
                      </Animated.View>
                    ) : null}
                  </View>
                </ContainerWidthContext.Provider>
              </>
            ) : null}
          </Animated.View>
        </View>
      </ColumnOpenStoreContext.Provider>
    </SplitViewContext.Provider>
  );
};
