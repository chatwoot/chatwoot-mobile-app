import React from 'react';
import { Pressable, ImageSourcePropType, TextInput, View } from 'react-native';

import { StackActions, useNavigation } from '@react-navigation/native';
import Animated, {
  FadeIn,
  interpolate,
  LinearTransition,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Icon } from '@/components-next';
import { CloseIcon, VoiceNote, SendIcon } from '@/svg-icons';
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

const initialMessages = [
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

  const [messageContent, setMessageContent] = React.useState('');
  const [messages, setMessages] = React.useState(initialMessages);

  const handleBackPress = () => {
    navigation.dispatch(StackActions.pop());
  };

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          content: messageContent,
          orientation: ORIENTATION.RIGHT,
          avatarInfo: {
            name: 'You',
            src: { uri: 'https://via.placeholder.com/150' },
          },
          variant: MESSAGE_VARIANTS.AGENT,
        },
      ]);
      setMessageContent('');
    }
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
          ListFooterComponent={() => <TypingIndicator typingText="Typing..." />}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item, index) => `${item.content}-${index}`}
          estimatedItemSize={70}
        />
        <Animated.View
          style={tailwind.style(
            'absolute bottom-0 left-0 right-0 bg-white px-2 py-2 flex-row items-center border-t border-gray-100',
          )}>
          <View
            style={tailwind.style(
              'flex-1 flex-row items-center bg-gray-100 rounded-full px-2 py-1 mr-2',
            )}>
            <TextInput
              style={tailwind.style(
                'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                'ml-[5px] mr-2 py-2 pl-3 pr-[36px] rounded-2xl text-gray-950',
                'min-h-9 max-h-[76px]',
              )}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={messageContent}
              onChangeText={setMessageContent}
            />
          </View>
          <Pressable onPress={handleSendMessage}>
            <View
              style={tailwind.style(
                'h-10 w-10 rounded-full bg-gray-950 items-center justify-center',
                // messageContent ? 'bg-amber-500' : 'bg-gray-100',
              )}>
              <Icon icon={<SendIcon />} size={20} />
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

export default CaptainScreen;
