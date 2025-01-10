import { withSpring } from 'react-native-reanimated';

export const photoIconExitAnimation = () => {
  'worklet';
  const animations = {
    opacity: withSpring(0, { damping: 20, stiffness: 180 }),
    transform: [
      { translateX: withSpring(-10, { damping: 20, stiffness: 180 }) },
      { scale: withSpring(0.9, { damping: 20, stiffness: 180 }) },
    ],
  };
  const initialValues = {
    opacity: 1,
    transform: [{ translateX: 0 }, { scale: 1 }],
  };
  return {
    initialValues,
    animations,
  };
};

export const photoIconEnterAnimation = () => {
  'worklet';
  const animations = {
    opacity: withSpring(1, { damping: 20, stiffness: 180 }),
    transform: [
      { translateX: withSpring(0, { damping: 20, stiffness: 180 }) },
      { scale: withSpring(1, { damping: 20, stiffness: 180 }) },
    ],
  };
  const initialValues = {
    opacity: 0,
    transform: [{ translateX: -10 }, { scale: 0.9 }],
  };
  return {
    initialValues,
    animations,
  };
};

export const voiceNoteIconExitAnimation = () => {
  'worklet';
  const animations = {
    opacity: withSpring(0, { damping: 20, stiffness: 180 }),
    transform: [{ scale: withSpring(0.9, { damping: 20, stiffness: 180 }) }],
  };
  const initialValues = {
    opacity: 1,
    transform: [{ scale: 1 }],
  };
  return {
    initialValues,
    animations,
  };
};

export const voiceNoteIconEnterAnimation = () => {
  'worklet';
  const animations = {
    opacity: withSpring(1, { damping: 20, stiffness: 180 }),
    transform: [{ scale: withSpring(1, { damping: 20, stiffness: 180 }) }],
  };
  const initialValues = {
    opacity: 0,
    transform: [{ scale: 0.9 }],
  };
  return {
    initialValues,
    animations,
  };
};

export const sendIconExitAnimation = () => {
  'worklet';
  const animations = {
    opacity: withSpring(0, { damping: 20, stiffness: 180 }),
    transform: [{ scale: withSpring(0.9, { damping: 20, stiffness: 180 }) }],
  };
  const initialValues = {
    opacity: 1,
    transform: [{ scale: 1 }],
  };
  return {
    initialValues,
    animations,
  };
};

export const sendIconEnterAnimation = () => {
  'worklet';
  const animations = {
    opacity: withSpring(1, { damping: 20, stiffness: 180 }),
    transform: [{ scale: withSpring(1, { damping: 20, stiffness: 180 }) }],
  };
  const initialValues = {
    opacity: 0,
    transform: [{ scale: 0.9 }],
  };
  return {
    initialValues,
    animations,
  };
};
