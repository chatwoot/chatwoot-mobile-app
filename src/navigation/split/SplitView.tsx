import { useTailwind } from '@/theme/useTailwind';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import { ContainerWidthContext } from '@/context';
import { useIsSplitLayout } from '@/utils';
import { DashboardColumnParams, SecondaryColumn, SplitViewContext } from './SplitViewContext';
import { ConversationPane } from './ConversationPane';
import { EmptyPane } from './EmptyPane';
import { SecondaryPane } from './SecondaryPane';

type SplitViewProps = PropsWithChildren<{
  resetKey?: unknown;
  emptyIcon?: React.ReactElement;
  emptyMessage?: string;
}>;

const WARM_ACTIONS_COLUMN: SecondaryColumn = { kind: 'actions' };
const COLUMN_HIDE_DISTANCE = 24;

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
  const [isPreviewing, setPreviewing] = useState(false);
  const isColumnShown = secondary !== null;
  const columnOpenStore = useRef(createColumnOpenStore()).current;
  const [isActionsWarm, setActionsWarm] = useState(false);
  useEffect(() => {
    setActionsWarm(false);
    if (!selectedConversationId) return;
    const task = InteractionManager.runAfterInteractions(() => setActionsWarm(true));
    return () => task.cancel();
  }, [selectedConversationId]);
  const isSecondaryOpen = isColumnShown && !isPreviewing;
  const [totalWidth, setTotalWidth] = useState<number | null>(null);
  const offset = useSharedValue(0);
  const generationSV = useSharedValue(0);
  // After a slide lands: record the column as open (the pre-built actions if none was set) or
  // clear it, unless a newer slide or swipe has started since.
  const settleColumn = useCallback(
    (open: boolean, generation: number) => {
      if (generation !== generationSV.value) return;
      setPreviewing(false);
      setSecondary(current => (open ? (current ?? { kind: 'actions' }) : null));
    },
    [generationSV],
  );

  // Invalidate a pending close/swipe before opening another column. Otherwise its
  // completion callback can clear the newly selected Macros (or contact) pane.
  const openColumn = useCallback(
    (column: SecondaryColumn) => {
      generationSV.value += 1;
      setPreviewing(false);
      setSecondary(column);
    },
    [generationSV],
  );

  const value = useMemo(
    () => ({
      selectedConversationId,
      openConversation: (id: number) => {
        generationSV.value += 1;
        setPreviewing(false);
        setSecondary(null);
        setSelectedConversationId(id);
      },
      closeConversation: () => {
        generationSV.value += 1;
        setPreviewing(false);
        setSecondary(null);
        setSelectedConversationId(null);
      },
      secondary,
      isSecondaryOpen,
      openContact: () => openColumn({ kind: 'contact' }),
      openActions: () => {
        generationSV.value += 1;
        setPreviewing(false);
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
      openMacros: () => openColumn({ kind: 'macros' }),
      openCompose: () => openColumn({ kind: 'compose' }),
      openDashboard: (params: DashboardColumnParams) =>
        openColumn({ kind: 'dashboard', ...params }),
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
    [
      selectedConversationId,
      secondary,
      isSecondaryOpen,
      isActionsWarm,
      listWidth,
      columnOpenStore,
      generationSV,
      offset,
      settleColumn,
      openColumn,
    ],
  );

  const listNavigation = useNavigation();
  const wasSplit = useRef(isSplit);
  useEffect(() => {
    if (wasSplit.current && !isSplit) {
      if (selectedConversationId) {
        listNavigation.dispatch(
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

  const wideWidth = totalWidth ? totalWidth - listWidth - 1 : null;
  const detailWidth = wideWidth !== null ? wideWidth - safeRight : null;
  const contactWidth = listWidth + safeRight;
  const openOffset = -(listWidth + 1);
  useEffect(() => {
    if (isPreviewing) return;
    offset.value = withSpring(isSecondaryOpen ? openOffset : 0, SLIDE_SPRING);
  }, [isSecondaryOpen, isPreviewing, openOffset, offset]);
  const stripStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));
  const columnStyle = useAnimatedStyle(() => ({
    opacity: offset.value < -COLUMN_HIDE_DISTANCE ? 1 : 0,
  }));
  const restColor = tailwind.color(selectedConversationId ? 'bg-white' : 'bg-gray-50') as string;
  const lineColor = tailwind.color('bg-blackA-A3') as string;
  const dividerStyle = useAnimatedStyle(
    () => ({ backgroundColor: offset.value < -COLUMN_HIDE_DISTANCE ? lineColor : restColor }),
    [restColor, lineColor],
  );

  const isPreviewSV = useSharedValue(0);
  const startOffsetSV = useSharedValue(0);
  const canDragSV = useSharedValue(0);
  useEffect(() => {
    canDragSV.value = (isActionsWarm || !!secondary) && !!selectedConversationId ? 1 : 0;
  }, [isActionsWarm, secondary, selectedConversationId, canDragSV]);
  const markColumnOpen = (open: boolean) => columnOpenStore.set(open);
  useEffect(() => {
    if (!isPreviewing) columnOpenStore.set(isSecondaryOpen);
  }, [isSecondaryOpen, isPreviewing, columnOpenStore]);
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
  return (
    <SplitViewContext.Provider value={isSplit ? value : null}>
      <ColumnOpenStoreContext.Provider value={isSplit ? columnOpenStore : null}>
        <View
          style={tailwind.style('flex-1 bg-white overflow-hidden')}
          onLayout={e => setTotalWidth(Math.round(e.nativeEvent.layout.width))}>
          <Animated.View style={[tailwind.style('flex-1 flex-row'), isSplit ? stripStyle : null]}>
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
                <Animated.View style={[tailwind.style('w-[1px]'), dividerStyle]} />
                <ContainerWidthContext.Provider value={contactWidth - safeRight}>
                  <View
                    style={[
                      { width: contactWidth },
                      tailwind.style(selectedConversationId ? 'bg-white' : 'bg-gray-50'),
                    ]}>
                    {/* The actions column is built ahead (hidden) so a swipe can slide it in at
                      once. */}
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
