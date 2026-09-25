import { useEffect } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useHaptic } from '@/utils';

import {
  CARD_FIRST,
  CARD_REST,
  SWIPE_COMMIT,
  SWIPE_FILL,
  SWIPE_GREEN_RGB,
  SWIPE_OVERDRAG,
  SWIPE_PARK,
  SWIPE_RED_RGB,
  SWIPE_ROW_EXIT,
  SWIPE_ROW_HEIGHT,
  SWIPE_SETTLE_MIN,
} from '../constants/swipeRow';
import { rgba } from '../utils/rgba';

export type SwipeAction = 'answer' | 'decline';

type Options = {
  // The first card is white, the rest a shade darker
  first: boolean;
  // Row index, which staggers a fade of every row
  index: number;
  // Set when every row is to fade out together
  fadeAll: boolean;
  // Resolve true once the action went through; false springs the row back
  onAnswer: () => Promise<boolean>;
  onDecline: () => Promise<boolean>;
  onLeaving: (action: SwipeAction) => void;
};

// The swipe that answers or declines a ringing row. The card follows the finger: a short
// drag parks the button in the space it uncovered; past the threshold the row fills with
// the colour, a haptic fires, and letting go commits. Below it the card springs back.
export const useSwipeToAct = ({
  first,
  index,
  fadeAll,
  onAnswer,
  onDecline,
  onLeaving,
}: Options) => {
  const offset = useSharedValue(0);
  const settled = useSharedValue(0);
  const leaving = useSharedValue(false);
  const fading = useSharedValue(false);
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const rowHeight = useSharedValue(SWIPE_ROW_HEIGHT);
  const rowGap = useSharedValue(0);
  const armed = useSharedValue(false);
  const hapticArm = useHaptic('medium');
  const onArm = () => hapticArm?.();

  const settle = (target: number) => {
    'worklet';
    settled.value = target;
    offset.value = withSpring(target, { damping: 16, stiffness: 240 });
  };

  const restore = () => {
    leaving.value = false;
    fading.value = false;
    cardOpacity.value = withTiming(1, { duration: 200 });
    cardScale.value = withTiming(1, { duration: 200 });
    rowHeight.value = withTiming(SWIPE_ROW_HEIGHT, { duration: 200 });
    rowGap.value = withTiming(0, { duration: 200 });
    settle(0);
  };

  // Slides the card off, then folds the row shut; the store removes it once the server agrees
  const commit = async (action: SwipeAction) => {
    if (leaving.value) return;
    leaving.value = true;
    onLeaving(action);
    offset.value = withTiming(action === 'answer' ? SWIPE_ROW_EXIT : -SWIPE_ROW_EXIT, {
      duration: 280,
      easing: Easing.bezier(0.2, 0.7, 0.2, 1),
    });
    cardOpacity.value = withTiming(0, { duration: 240 });
    rowHeight.value = withDelay(220, withTiming(0, { duration: 260 }));
    rowGap.value = withDelay(220, withTiming(-6, { duration: 260 }));
    const ok = await (action === 'answer' ? onAnswer() : onDecline());
    if (!ok) restore();
  };

  // Declining everything: the card shrinks and fades in place, a little after the one above
  useEffect(() => {
    if (!fadeAll || leaving.value) return;
    leaving.value = true;
    fading.value = true;
    const delay = index * 50;
    cardScale.value = withDelay(delay, withTiming(0.94, { duration: 280 }));
    cardOpacity.value = withDelay(delay, withTiming(0, { duration: 240 }));
    rowHeight.value = withDelay(220 + delay, withTiming(0, { duration: 260 }));
    rowGap.value = withDelay(220 + delay, withTiming(-6, { duration: 260 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadeAll]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-8, 8])
    .onUpdate(event => {
      if (leaving.value) return;
      let x = settled.value + event.translationX;
      const over = Math.abs(x) - SWIPE_COMMIT;
      // Past the threshold the card only creeps further
      if (over > 0) x = Math.sign(x) * (SWIPE_COMMIT + over * SWIPE_OVERDRAG);
      offset.value = x;
      const past = Math.abs(x) > SWIPE_COMMIT;
      if (past && !armed.value) runOnJS(onArm)();
      armed.value = past;
    })
    .onEnd(() => {
      armed.value = false;
      if (leaving.value) return;
      if (offset.value > SWIPE_COMMIT) {
        runOnJS(commit)('answer');
        return;
      }
      if (offset.value < -SWIPE_COMMIT) {
        runOnJS(commit)('decline');
        return;
      }
      if (offset.value > SWIPE_SETTLE_MIN) settle(SWIPE_PARK);
      else if (offset.value < -SWIPE_SETTLE_MIN) settle(-SWIPE_PARK);
      else settle(0);
    });
  // A tap on a parked card slides it closed
  const tap = Gesture.Tap().onEnd(() => {
    if (settled.value !== 0 && !leaving.value) settle(0);
  });
  const gesture = Gesture.Race(pan, tap);

  // 0 while the button is merely parked, 1 once the row has filled with its colour
  const fillAmount = () => {
    'worklet';
    if (fading.value) return 0;
    if (leaving.value) return 1;
    return Math.max(0, Math.min(1, (Math.abs(offset.value) - SWIPE_PARK) / SWIPE_FILL));
  };

  const revealButton = (direction: 1 | -1) => {
    'worklet';
    const visible = direction > 0 ? offset.value > 0 : offset.value < 0;
    const reveal = Math.min(1, Math.abs(offset.value) / SWIPE_PARK);
    const k = fillAmount();
    return {
      opacity: visible ? reveal : 0,
      transform: [{ scale: visible ? (k >= 1 ? 1 : 0.85 + 0.15 * reveal) : 0.85 }],
      backgroundColor: rgba(direction > 0 ? SWIPE_GREEN_RGB : SWIPE_RED_RGB, 1 - k),
    };
  };

  const wrapStyle = useAnimatedStyle(() => {
    const dir = Math.sign(offset.value);
    return {
      height: rowHeight.value,
      marginBottom: rowGap.value,
      backgroundColor:
        dir === 0 ? 'transparent' : rgba(dir > 0 ? SWIPE_GREEN_RGB : SWIPE_RED_RGB, fillAmount()),
    };
  });
  const answerButtonStyle = useAnimatedStyle(() => revealButton(1));
  const declineButtonStyle = useAnimatedStyle(() => revealButton(-1));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }, { scale: cardScale.value }],
    opacity: cardOpacity.value,
    backgroundColor: offset.value !== 0 ? CARD_FIRST : first ? CARD_FIRST : CARD_REST,
  }));
  const tintStyle = useAnimatedStyle(() => {
    const dir = Math.sign(offset.value);
    const t = Math.min(1, Math.abs(offset.value) / SWIPE_COMMIT);
    return {
      opacity: dir === 0 ? 0 : 0.04 + t * 0.16,
      backgroundColor: `rgb(${dir > 0 ? SWIPE_GREEN_RGB : SWIPE_RED_RGB})`,
    };
  });

  return {
    gesture,
    commit,
    wrapStyle,
    answerButtonStyle,
    declineButtonStyle,
    cardStyle,
    tintStyle,
  };
};
