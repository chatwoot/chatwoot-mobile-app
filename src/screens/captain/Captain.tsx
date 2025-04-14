import React from 'react';
import { Pressable, ImageSourcePropType } from 'react-native';

import { StackActions, useNavigation } from '@react-navigation/native';
import Animated, {
  FadeIn,
  interpolate,
  LinearTransition,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Icon } from '@/components-next';
import { CloseIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { TypingIndicator } from './TypingIndicator';

import { MESSAGE_VARIANTS } from '@/constants';
import { MarkdownBubble } from './MarkdownBubble';
import { useAppKeyboardAnimation } from '@/utils';
import { FlashList } from '@shopify/flash-list';

const AnimatedFlashlist = Animated.createAnimatedComponent(
  FlashList<{
    content: string;
    orientation: string;
    avatarInfo: { name: string; src: ImageSourcePropType };
    variant: string;
  }>,
);

const ORIENTATION = {
  LEFT: 'left',
  RIGHT: 'right',
};

const variantBaseMap = {
  [MESSAGE_VARIANTS.AGENT]: 'bg-gray-100 pl-3 pr-2.5 py-2 ',
  [MESSAGE_VARIANTS.USER]: 'bg-white',
};

const variantBorderMap = {
  [MESSAGE_VARIANTS.AGENT]: 'border-gray-100',
  [MESSAGE_VARIANTS.USER]: 'border-gray-100',
};

type MessageProps = {
  content: string;
  orientation: string;
  avatarInfo: { name: string; src: ImageSourcePropType };
  variant: string;
};

const MessageItem = ({ content, orientation, avatarInfo, variant }: MessageProps) => {
  console.log('orientation', orientation);
  const flexOrientationClass = () => {
    const map = {
      [ORIENTATION.LEFT]: 'items-start',
      [ORIENTATION.RIGHT]: 'items-end',
    };
    return map[orientation];
  };

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={[tailwind.style('my-[1px] mb-2', flexOrientationClass())]}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        {/* <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
          <Avatar size={'md'} src={avatarInfo.src} name={avatarInfo.name || ''} />
        </Animated.View> */}
        <Animated.View
          style={[
            tailwind.style(
              'relative rounded-2xl overflow-hidden',
              variantBaseMap[variant],
              variantBorderMap[variant],
            ),
          ]}>
          <MarkdownBubble messageContent={content} variant={variant} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const messages = [
  {
    content: 'Hello, how are you?',
    orientation: 'right',
    avatarInfo: {
      name: 'John Doe',
      src: { uri: 'https://via.placeholder.com/150' },
    },
    variant: MESSAGE_VARIANTS.AGENT,
  },
  {
    content: 'Hello, how are you?',
    orientation: ORIENTATION.LEFT,
    avatarInfo: {
      name: 'John Doe',
      src: { uri: 'https://via.placeholder.com/150' },
    },
    variant: MESSAGE_VARIANTS.USER,
  },

  {
    content: 'Hello, how are you?',
    orientation: 'right',
    avatarInfo: {
      name: 'John Doe',
      src: { uri: 'https://via.placeholder.com/150' },
    },
    variant: MESSAGE_VARIANTS.AGENT,
  },
  {
    content: 'Hello, how are you?',
    orientation: 'right',
    avatarInfo: {
      name: 'John Doe',
      src: { uri: 'https://via.placeholder.com/150' },
    },
    variant: MESSAGE_VARIANTS.AGENT,
  },
];

const CaptainScreen = () => {
  const navigation = useNavigation();
  const { progress, height } = useAppKeyboardAnimation();

  const handleBackPress = () => {
    navigation.dispatch(StackActions.pop());
  };

  const animatedFlashlistStyle = useAnimatedStyle(() => {
    return {
      marginBottom: withSpring(interpolate(progress.value, [0, 1], [0, height.value]), {
        stiffness: 240,
        damping: 38,
      }),
    };
  });

  return (
    <Animated.View style={tailwind.style('flex-1')}>
      <Animated.View
        style={tailwind.style(
          'flex flex-row items-center justify-between px-4 border-b-[1px] border-b-blackA-A3 py-[12px] bg-white',
        )}>
        <Pressable style={tailwind.style('opacity-0')}>
          <Animated.View>
            <Icon icon={<CloseIcon />} size={24} />
          </Animated.View>
        </Pressable>
        <Animated.View>
          <Animated.Text
            style={tailwind.style(
              'text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
            )}>
            Ask Captain
          </Animated.Text>
        </Animated.View>
        <Pressable hitSlop={16} onPress={handleBackPress}>
          <Animated.View>
            <Icon icon={<CloseIcon />} size={24} />
          </Animated.View>
        </Pressable>
      </Animated.View>
      <Animated.View
        layout={LinearTransition.springify().damping(38).stiffness(240)}
        style={[tailwind.style('flex-1 min-h-10 bg-white pt-2 px-2'), animatedFlashlistStyle]}>
        <AnimatedFlashlist
          layout={LinearTransition.springify().damping(38).stiffness(240)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MessageItem
              content={item.content}
              orientation={item.orientation}
              avatarInfo={item.avatarInfo}
              variant={item.variant}
            />
          )}
          data={messages}
          contentContainerStyle={tailwind.style('px-3')}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item, index) => `${item.content}-${index}`}
          estimatedItemSize={70}
        />
        <TypingIndicator typingText="Typing..." />
      </Animated.View>
    </Animated.View>
  );
};

export default CaptainScreen;
