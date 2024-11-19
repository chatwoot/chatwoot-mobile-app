import React, { useMemo } from 'react';
import { Keyboard, Pressable, PressableProps } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  LinearTransition,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChatWindowContext, useRefsContext } from '@/context';
import {
  selectMessageContent,
  selectAttachments,
  selectIsPrivateMessage,
  selectQuoteMessage,
  resetSentMessage,
  updateAttachments,
} from '@/store/conversation/sendMessageSlice';
import { AddIcon, PhotosIcon, SendIcon, VoiceNote } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '@/components-next/common';

import { AttachedMedia } from './AttachedMedia';
import { AudioRecorder } from './audio-recorder';
import { CommandOptionsMenu, handleOpenPhotosLibrary } from './CommandOptionsMenu';
import {
  photoIconEnterAnimation,
  photoIconExitAnimation,
  sendIconEnterAnimation,
  sendIconExitAnimation,
  voiceNoteIconEnterAnimation,
  voiceNoteIconExitAnimation,
} from './customAnimations';
import { MessageTextInput } from './message-input';
import { QuoteReply } from './QuoteReply';
import { conversationActions } from '@/store/conversation/conversationActions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { SendMessagePayload } from '@/store/conversation/conversationTypes';
import { selectUserId, selectUserThumbnail } from '@/store/auth/authSelectors';

const SHEET_APPEAR_SPRING_CONFIG: WithSpringConfig = {
  damping: 20,
  stiffness: 120,
};

const AnimatedKeyboardStickyView = Animated.createAnimatedComponent(KeyboardStickyView);

type SendMessageButtonProps = PressableProps & {};

const SendMessageButton = (props: SendMessageButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();
  const isPrivateMessage = useAppSelector(selectIsPrivateMessage);

  return (
    <Pressable {...props} {...handlers}>
      <Animated.View
        layout={LinearTransition.springify().damping(20).stiffness(180)}
        entering={sendIconEnterAnimation}
        exiting={sendIconExitAnimation}
        style={[tailwind.style('flex items-center justify-center h-10 w-10'), animatedStyle]}>
        <Animated.View
          style={tailwind.style(
            'flex items-center justify-center h-7 w-7 rounded-full bg-gray-950',
            isPrivateMessage ? 'bg-amber-700' : 'bg-gray-950',
          )}>
          <Icon icon={<SendIcon />} size={16} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

type AddCommandButtonProps = PressableProps & {
  derivedAddMenuOptionStateValue: SharedValue<number>;
};

const AddCommandButton = (props: AddCommandButtonProps) => {
  const { derivedAddMenuOptionStateValue, ...otherProps } = props;
  const { animatedStyle, handlers } = useScaleAnimation();

  const addIconAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(derivedAddMenuOptionStateValue.value, [0, 1], [0, 45])}deg`,
        },
      ],
    };
  });

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(180)}
      style={animatedStyle}>
      <Pressable
        {...otherProps}
        style={({ pressed }) => [tailwind.style(pressed ? 'opacity-70' : '')]}
        {...handlers}>
        <Animated.View
          style={[
            tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl'),
            addIconAnimation,
          ]}>
          <Icon icon={<AddIcon />} size={24} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

type VoiceRecordButtonProps = PressableProps & {};

const VoiceRecordButton = (props: VoiceRecordButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();

  return (
    <Pressable {...props} {...handlers}>
      <Animated.View
        entering={voiceNoteIconEnterAnimation}
        exiting={voiceNoteIconExitAnimation}
        style={[
          tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl'),
          animatedStyle,
        ]}>
        <Icon icon={<VoiceNote />} size={24} />
      </Animated.View>
    </Pressable>
  );
};

type PhotosCommandButtonProps = PressableProps & {};

const PhotosCommandButton = (props: PhotosCommandButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();

  return (
    <Pressable
      {...props}
      {...handlers}
      style={({ pressed }) => [tailwind.style(pressed ? 'opacity-70' : '')]}>
      <Animated.View
        entering={photoIconEnterAnimation}
        exiting={photoIconExitAnimation}
        style={[
          tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl'),
          animatedStyle,
        ]}>
        <Icon icon={<PhotosIcon />} size={24} />
      </Animated.View>
    </Pressable>
  );
};

const BottomSheetContent = () => {
  const hapticSelection = useHaptic();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const userThumbnail = useAppSelector(selectUserThumbnail);

  const messageContent = useAppSelector(selectMessageContent);
  const attachments = useAppSelector(selectAttachments);
  const isPrivateMessage = useAppSelector(selectIsPrivateMessage);
  const quoteMessage = useAppSelector(selectQuoteMessage);

  // const { addNewMessage } = useMessageList();
  const { bottom } = useSafeAreaInsets();
  const {
    isAddMenuOptionSheetOpen,
    setAddMenuOptionSheetState,
    textInputRef,
    isVoiceRecorderOpen,
    setIsVoiceRecorderOpen,
    isTextInputFocused,
    conversationId,
  } = useChatWindowContext();

  const { messageListRef } = useRefsContext();

  const attachmentsLength = useMemo(() => {
    return attachments.length;
  }, [attachments.length]);

  const derivedAddMenuOptionStateValue = useDerivedValue(() => {
    return isAddMenuOptionSheetOpen
      ? withSpring(1, SHEET_APPEAR_SPRING_CONFIG)
      : withSpring(0, SHEET_APPEAR_SPRING_CONFIG);
  });

  const showAddMenuOption = () => {
    if (isAddMenuOptionSheetOpen) {
      hapticSelection?.();
      setAddMenuOptionSheetState(false);
    } else {
      Keyboard.dismiss();
      hapticSelection?.();
      setAddMenuOptionSheetState(true);
    }
  };

  const onPressVoiceRecordIcon = () => {
    setIsVoiceRecorderOpen(true);
    setAddMenuOptionSheetState(false);
  };

  const setReplyToInPayload = (payload: SendMessagePayload): SendMessagePayload => {
    if (quoteMessage?.id) {
      return {
        ...payload,
        contentAttributes: {
          ...payload.contentAttributes,
          inReplyTo: quoteMessage.id,
        },
      };
    }
    return payload; // Return original payload if no quote message
  };

  const sendMessage = () => {
    hapticSelection?.();

    textInputRef?.current?.clear();
    if (messageContent.length >= 0) {
      let payload: SendMessagePayload = {
        conversationId: conversationId,
        message: messageContent,
        private: isPrivateMessage,
        sender: {
          id: userId ?? 0,
          thumbnail: userThumbnail ?? '',
        },
      };
      payload = setReplyToInPayload(payload);
      dispatch(conversationActions.sendMessage(payload));
      dispatch(resetSentMessage());
      messageListRef?.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const handleOnPressPhotoButton = () => {
    textInputRef?.current?.blur();
    hapticSelection?.();
    handleOpenPhotosLibrary(updateAttachments);
  };

  const animatedInputWrapperStyle = useAnimatedStyle(() => {
    return {
      marginBottom: isTextInputFocused ? 0 : bottom,
    };
  }, [isTextInputFocused]);

  return (
    <Animated.View layout={LinearTransition.springify().damping(38).stiffness(240)}>
      <AnimatedKeyboardStickyView style={[tailwind.style('bg-white'), animatedInputWrapperStyle]}>
        <Animated.View
          layout={LinearTransition.springify().damping(38).stiffness(240)}
          style={tailwind.style('py-2 border-t-[1px] border-t-blackA-A3')}>
          {quoteMessage ? (
            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(10)}>
              <QuoteReply />
            </Animated.View>
          ) : null}
          {isVoiceRecorderOpen ? <AudioRecorder /> : null}
          {!isVoiceRecorderOpen ? (
            <Animated.View style={tailwind.style('flex flex-row px-1 items-end z-20 relative')}>
              <AddCommandButton
                onPress={showAddMenuOption}
                derivedAddMenuOptionStateValue={derivedAddMenuOptionStateValue}
              />
              {messageContent.length > 0 || isAddMenuOptionSheetOpen ? null : (
                <PhotosCommandButton onPress={handleOnPressPhotoButton} />
              )}
              <MessageTextInput />
              {messageContent.length > 0 || attachmentsLength > 0 ? (
                <SendMessageButton onPress={sendMessage} />
              ) : null}
              {messageContent.length === 0 && attachmentsLength === 0 ? (
                <VoiceRecordButton onPress={onPressVoiceRecordIcon} />
              ) : null}
            </Animated.View>
          ) : null}
        </Animated.View>
        {isAddMenuOptionSheetOpen ? (
          <CommandOptionsMenu />
        ) : attachmentsLength > 0 ? (
          <AttachedMedia />
        ) : null}
      </AnimatedKeyboardStickyView>
    </Animated.View>
  );
};

export const ReplyBox = () => {
  // const { bottom } = useSafeAreaInsets();

  // const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    // <BottomSheet
    //   ref={bottomSheetRef}
    //   handleComponent={null}
    //   enableDynamicSizing
    //   keyboardBlurBehavior="restore"
    //   enableContentPanningGesture={false}
    //   enableOverDrag={false}
    //   bottomInset={bottom}
    //   children={BottomSheetContent}
    // />
    <BottomSheetContent />
  );
};
