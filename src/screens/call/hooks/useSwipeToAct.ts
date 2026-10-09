import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useHaptic } from '@/utils';

import {
  SWIPE_ANIMATION_MS,
  SWIPE_OPEN,
  SWIPE_REMOVE_DELAY_MS,
  SWIPE_ROW_HEIGHT,
  SWIPE_SNAP,
} from '../constants/swipeRow';

export type SwipeAction = 'answer' | 'decline';

type Options = {
  // Row index, which staggers every row leaving together
  index: number;
  // Set when every row is to leave together, as declined
  declineAll: boolean;
  // Resolve true once the action went through; false brings the row back
  onAnswer: () => Promise<boolean>;
  onDecline: () => Promise<boolean>;
  onLeaving: (action: SwipeAction) => void;
};

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);
const glide = (to: number) => {
  'worklet';
  return withTiming(to, { duration: SWIPE_ANIMATION_MS, easing: EASE });
};

// The swipe that answers or declines a ringing row. The row follows the finger and uncovers
// a full-height panel the width of the drag: answer on the left, decline on the right. On
// release a short drag springs shut, a longer one stays open on the action, and past half
// the row the row slides off and acts. A tap on an open row closes it.
export const useSwipeToAct = ({ index, declineAll, onAnswer, onDecline, onLeaving }: Options) => {
  const { width } = useWindowDimensions();
  const offset = useSharedValue(0);
  const start = useSharedValue(0);
  const leaving = useSharedValue(false);
  const armed = useSharedValue(false);
  const rowHeight = useSharedValue(SWIPE_ROW_HEIGHT);
  const rowGap = useSharedValue(0);
  const hapticArm = useHaptic('medium');
  const onArm = () => hapticArm?.();

  const fold = (delay: number) => {
    rowHeight.value = withDelay(delay, glide(0));
    rowGap.value = withDelay(delay, glide(-1));
  };

  const restore = () => {
    leaving.value = false;
    rowHeight.value = glide(SWIPE_ROW_HEIGHT);
    rowGap.value = glide(0);
    offset.value = glide(0);
  };

  // Slides the row off, then folds it shut; the store removes it once the server agrees
  const commit = async (action: SwipeAction) => {
    if (leaving.value) return;
    leaving.value = true;
    onLeaving(action);
    offset.value = glide(action === 'answer' ? width : -width);
    fold(SWIPE_REMOVE_DELAY_MS);
    const ok = await (action === 'answer' ? onAnswer() : onDecline());
    if (!ok) restore();
  };

  // Declining everything: each row slides off to the left, a little after the one above
  useEffect(() => {
    if (!declineAll || leaving.value) return;
    leaving.value = true;
    const delay = index * 40;
    offset.value = withDelay(delay, glide(-width));
    fold(delay + SWIPE_REMOVE_DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [declineAll]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-8, 8])
    .onStart(() => {
      start.value = offset.value;
    })
    .onUpdate(event => {
      if (leaving.value) return;
      const x = Math.max(-width, Math.min(width, start.value + event.translationX));
      offset.value = x;
      const past = Math.abs(x) > width / 2;
      if (past && !armed.value) runOnJS(onArm)();
      armed.value = past;
    })
    .onEnd(() => {
      armed.value = false;
      if (leaving.value) return;
      const x = offset.value;
      if (x > width / 2) {
        runOnJS(commit)('answer');
        return;
      }
      if (x < -width / 2) {
        runOnJS(commit)('decline');
        return;
      }
      offset.value = glide(x > SWIPE_SNAP ? SWIPE_OPEN : x < -SWIPE_SNAP ? -SWIPE_OPEN : 0);
    });
  const tap = Gesture.Tap().onEnd(() => {
    if (offset.value !== 0 && !leaving.value) offset.value = glide(0);
  });
  const gesture = Gesture.Race(pan, tap);

  const wrapStyle = useAnimatedStyle(() => ({
    height: rowHeight.value,
    marginBottom: rowGap.value,
  }));
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));
  const answerPanelStyle = useAnimatedStyle(() => ({ width: Math.max(offset.value, 0) }));
  const declinePanelStyle = useAnimatedStyle(() => ({ width: Math.max(-offset.value, 0) }));

  return { gesture, commit, wrapStyle, rowStyle, answerPanelStyle, declinePanelStyle };
};
