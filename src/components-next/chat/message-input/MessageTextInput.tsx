import React, { useCallback, useEffect } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  Pressable,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
} from 'react-native';
import Animated, {
  LayoutAnimationConfig,
  LinearTransition,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { useChatWindowContext } from '@/context';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  setMessageText,
  togglePrivateMessage,
  selectIsPrivateMessage,
  selectQuoteMessage,
} from '@/store/conversation/sendMessageSlice';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type MessageTextInputProps = {};

const Unlock = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 29 30" fill="none">
      <Path
        d="M10.3334 14.1667V11.6667C10.3334 10.5616 10.7724 9.50179 11.5538 8.72039C12.3352 7.93899 13.395 7.5 14.5 7.5C15.6051 7.5 16.6649 7.93899 17.4463 8.72039C17.8182 9.09225 18.1125 9.52716 18.3189 10M11.8334 22.5H17.1667C18.5667 22.5 19.2667 22.5 19.8017 22.2275C20.2721 21.9878 20.6545 21.6054 20.8942 21.135C21.1667 20.6 21.1667 19.9 21.1667 18.5V18.1667C21.1667 16.7667 21.1667 16.0667 20.8942 15.5317C20.6545 15.0613 20.2721 14.6788 19.8017 14.4392C19.2667 14.1667 18.5667 14.1667 17.1667 14.1667H11.8334C10.4334 14.1667 9.73337 14.1667 9.19837 14.4392C8.72799 14.6788 8.34555 15.0613 8.10587 15.5317C7.83337 16.0667 7.83337 16.7667 7.83337 18.1667V18.5C7.83337 19.9 7.83337 20.6 8.10587 21.135C8.34555 21.6054 8.72799 21.9878 9.19837 22.2275C9.73337 22.5 10.4334 22.5 11.8334 22.5Z"
        stroke="black"
        strokeOpacity="0.565"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const Locked = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 29 30" fill="none">
      <Rect y="0.5" width="29" height="29" rx="14.5" fill="white" />
      <Path
        d="M18.6667 14.1667V11.6667C18.6667 10.5616 18.2277 9.50179 17.4463 8.72039C16.6649 7.93899 15.6051 7.5 14.5 7.5C13.395 7.5 12.3352 7.93899 11.5538 8.72039C10.7724 9.50179 10.3334 10.5616 10.3334 11.6667V14.1667M11.8334 22.5H17.1667C18.5667 22.5 19.2667 22.5 19.8017 22.2275C20.2721 21.9878 20.6545 21.6054 20.8942 21.135C21.1667 20.6 21.1667 19.9 21.1667 18.5V18.1667C21.1667 16.7667 21.1667 16.0667 20.8942 15.5317C20.6545 15.0613 20.2721 14.6788 19.8017 14.4392C19.2667 14.1667 18.5667 14.1667 17.1667 14.1667H11.8334C10.4334 14.1667 9.73337 14.1667 9.19837 14.4392C8.72799 14.6788 8.34555 15.0613 8.10587 15.5317C7.83337 16.0667 7.83337 16.7667 7.83337 18.1667V18.5C7.83337 19.9 7.83337 20.6 8.10587 21.135C8.34555 21.6054 8.72799 21.9878 9.19837 22.2275C9.73337 22.5 10.4334 22.5 11.8334 22.5Z"
        stroke="black"
        strokeOpacity="0.565"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// eslint-disable-next-line no-empty-pattern
export const MessageTextInput = ({}: MessageTextInputProps) => {
  const messageText = useSharedValue('');
  const dispatch = useAppDispatch();

  const lockIconAnimatedPosition = useAnimatedStyle(() => {
    return {
      bottom: Platform.OS === 'ios' ? 5.5 : 6,
    };
  });

  const { setAddMenuOptionSheetState, textInputRef, setIsTextInputFocused } =
    useChatWindowContext();

  const isPrivateMessage = useAppSelector(selectIsPrivateMessage);
  const quoteMessage = useAppSelector(selectQuoteMessage);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: messageText.value,
    } as unknown as TextInputProps;
  });

  const onChangeText = (text: string) => {
    messageText.value = text.trimEnd();
    dispatch(setMessageText(text));
  };

  const handleOnFocus = useCallback(
    (_args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setAddMenuOptionSheetState(false);
      setIsTextInputFocused(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (quoteMessage !== null) {
      // Focussing Text Input when you have decided to reply
      // @ts-ignore
      textInputRef?.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteMessage]);

  const handleOnBlur = useCallback(
    (_args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      // shouldHandleKeyboardEvents.value = false;
      setIsTextInputFocused(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <LayoutAnimationConfig skipEntering={true}>
      <Animated.View
        layout={LinearTransition.springify().damping(20).stiffness(120)}
        style={[tailwind.style('flex-1 my-0.5')]}>
        <AnimatedTextInput
          // @ts-ignore
          ref={textInputRef}
          layout={LinearTransition.springify().damping(20).stiffness(120)}
          onChangeText={onChangeText}
          numberOfLines={3}
          multiline
          enablesReturnKeyAutomatically
          style={[
            tailwind.style(
              'text-base font-inter-normal-24 tracking-[0.24px] leading-[20px] android:leading-[18px]',
              'ml-[5px] mr-2 py-2 pl-3 pr-[36px] rounded-2xl text-gray-950',
              'min-h-9 max-h-[76px]',
              isPrivateMessage ? 'bg-amber-100' : 'bg-blackA-A4',
            ),
            // TODO: Try settings includeFontPadding to false and have a single lineHeight value of 20
          ]}
          placeholderTextColor={tailwind.color('bg-gray-800')}
          placeholder="Message..."
          onSubmitEditing={() => (messageText.value = '')}
          returnKeyType={'default'}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          animatedProps={animatedProps}
        />
      </Animated.View>
      <Animated.View
        style={[
          // Pre calculated value to position the lock
          tailwind.style('absolute right-[57px]'),
          lockIconAnimatedPosition,
        ]}>
        <Pressable hitSlop={5} onPress={() => dispatch(togglePrivateMessage())}>
          {isPrivateMessage ? (
            <Icon size={29} icon={<Locked />} />
          ) : (
            <Icon size={29} icon={<Unlock />} />
          )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  );
};
