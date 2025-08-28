import React, { FC, useCallback, useEffect, useMemo } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  Pressable,
  TextInputFocusEventData,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  LayoutAnimationConfig,
  LinearTransition,
  useAnimatedStyle,
} from 'react-native-reanimated';

import Svg, { Path, Rect } from 'react-native-svg';

import { useChatWindowContext, useTheme } from '@/context';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { useAppDispatch, useAppSelector, useThemedStyles } from '@/hooks';

import { MentionInput, MentionSuggestionsProps, Suggestion } from './mentions-input';
import {
  setMessageContent,
  togglePrivateMessage,
  selectIsPrivateMessage,
  selectQuoteMessage,
  selectMessageContent,
} from '@/store/conversation/sendMessageSlice';
import { REPLY_EDITOR_MODES } from '@/constants';
import i18n from '@/i18n';
import { createTypingIndicator } from '@chatwoot/utils';
import { conversationActions } from '@/store/conversation/conversationActions';
import { MentionUser } from './MentionUser';
import { Agent } from '@/types';

type MessageTextInputProps = {
  maxLength: number;
  replyEditorMode: string;
  selectedCannedResponse?: string | null;
  agents: Agent[];
  messageContent: string;
};
type AgentSuggestion = Omit<Agent, 'id'> & Suggestion;

const Unlock = ({
  stroke = 'black',
  strokeOpacity = '0.565',
}: {
  stroke?: string;
  strokeOpacity?: string;
}) => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 29 30" fill="none">
      <Path
        d="M10.3334 14.1667V11.6667C10.3334 10.5616 10.7724 9.50179 11.5538 8.72039C12.3352 7.93899 13.395 7.5 14.5 7.5C15.6051 7.5 16.6649 7.93899 17.4463 8.72039C17.8182 9.09225 18.1125 9.52716 18.3189 10M11.8334 22.5H17.1667C18.5667 22.5 19.2667 22.5 19.8017 22.2275C20.2721 21.9878 20.6545 21.6054 20.8942 21.135C21.1667 20.6 21.1667 19.9 21.1667 18.5V18.1667C21.1667 16.7667 21.1667 16.0667 20.8942 15.5317C20.6545 15.0613 20.2721 14.6788 19.8017 14.4392C19.2667 14.1667 18.5667 14.1667 17.1667 14.1667H11.8334C10.4334 14.1667 9.73337 14.1667 9.19837 14.4392C8.72799 14.6788 8.34555 15.0613 8.10587 15.5317C7.83337 16.0667 7.83337 16.7667 7.83337 18.1667V18.5C7.83337 19.9 7.83337 20.6 8.10587 21.135C8.34555 21.6054 8.72799 21.9878 9.19837 22.2275C9.73337 22.5 10.4334 22.5 11.8334 22.5Z"
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const Locked = ({
  stroke = 'black',
  strokeOpacity = '0.565',
  fill = 'white',
}: {
  stroke?: string;
  strokeOpacity?: string;
  fill?: string;
}) => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 29 30" fill="none">
      <Rect y="0.5" width="29" height="29" rx="14.5" fill={fill} />
      <Path
        d="M18.6667 14.1667V11.6667C18.6667 10.5616 18.2277 9.50179 17.4463 8.72039C16.6649 7.93899 15.6051 7.5 14.5 7.5C13.395 7.5 12.3352 7.93899 11.5538 8.72039C10.7724 9.50179 10.3334 10.5616 10.3334 11.6667V14.1667M11.8334 22.5H17.1667C18.5667 22.5 19.2667 22.5 19.8017 22.2275C20.2721 21.9878 20.6545 21.6054 20.8942 21.135C21.1667 20.6 21.1667 19.9 21.1667 18.5V18.1667C21.1667 16.7667 21.1667 16.0667 20.8942 15.5317C20.6545 15.0613 20.2721 14.6788 19.8017 14.4392C19.2667 14.1667 18.5667 14.1667 17.1667 14.1667H11.8334C10.4334 14.1667 9.73337 14.1667 9.19837 14.4392C8.72799 14.6788 8.34555 15.0613 8.10587 15.5317C7.83337 16.0667 7.83337 16.7667 7.83337 18.1667V18.5C7.83337 19.9 7.83337 20.6 8.10587 21.135C8.34555 21.6054 8.72799 21.9878 9.19837 22.2275C9.73337 22.5 10.4334 22.5 11.8334 22.5Z"
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
const TYPING_INDICATOR_IDLE_TIME = 4000;

// eslint-disable-next-line no-empty-pattern
export const MessageTextInput = ({
  maxLength,
  replyEditorMode,
  selectedCannedResponse,
  agents,
}: MessageTextInputProps) => {
  const themedTailwind = useThemedStyles();
  const { isDark } = useTheme();
  const dispatch = useAppDispatch();
  const messageContent = useAppSelector(selectMessageContent);

  const lockIconAnimatedPosition = useAnimatedStyle(() => {
    return {
      bottom: Platform.OS === 'ios' ? 5.5 : 6,
    };
  });

  const { setAddMenuOptionSheetState, textInputRef, setIsTextInputFocused, conversationId } =
    useChatWindowContext();

  const isPrivateMessage = useAppSelector(selectIsPrivateMessage);
  const quoteMessage = useAppSelector(selectQuoteMessage);

  const dispatchTypingStatus = useCallback(
    (status: 'on' | 'off') => {
      dispatch(
        conversationActions.toggleTyping({
          conversationId,
          typingStatus: status,
          isPrivate: isPrivateMessage,
        }),
      );
    },
    [dispatch, conversationId, isPrivateMessage],
  );

  const typingIndicator = useMemo(
    () =>
      createTypingIndicator(
        () => dispatchTypingStatus('on'),
        () => dispatchTypingStatus('off'),
        TYPING_INDICATOR_IDLE_TIME,
      ),
    [dispatchTypingStatus],
  );

  const startTyping = useCallback(() => {
    typingIndicator.start();
  }, [typingIndicator]);

  const onBlur = useCallback(() => {
    typingIndicator.stop();
  }, [typingIndicator]);

  useEffect(() => {
    return () => typingIndicator.stop();
  }, [typingIndicator]);

  const onChangeText = (text: string) => {
    startTyping();
    dispatch(setMessageContent(text));
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
    if (selectedCannedResponse) onChangeText(selectedCannedResponse);
  }, [selectedCannedResponse]);

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
      onBlur();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const toggleReplyMode = () => {
    if (replyEditorMode === REPLY_EDITOR_MODES.REPLY) {
      dispatch(togglePrivateMessage(!isPrivateMessage));
    }
  };

  const renderSuggestions: (suggestions: Agent[]) => FC<MentionSuggestionsProps> =
    suggestions =>
    // eslint-disable-next-line react/display-name
    ({ keyword, onSuggestionPress }) => {
      if (keyword == null || !isPrivateMessage) {
        return null;
      }
      const filteredSuggestions = suggestions.filter(one =>
        one.name?.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()),
      );
      return (
        <Animated.View
          style={[
            tailwind.style(
              'bg-white border-t border-gray-200 rounded-[13px] mx-4 px-2 w-full max-h-[250px]',
              Platform.OS === 'ios' ? 'absolute bottom-full' : 'relative h-[150px]',
            ),
            styles.listShadow,
          ]}
        >
          <ScrollView keyboardShouldPersistTaps="always">
            {filteredSuggestions.map(agent => {
              const agentSuggestion: AgentSuggestion = {
                ...agent,
                id: String(agent.id),
                name: agent.name || '',
              };
              return (
                <MentionUser
                  key={agent.id}
                  agent={agent}
                  lastItem={false}
                  onPress={() => onSuggestionPress(agentSuggestion)}
                />
              );
            })}
          </ScrollView>
        </Animated.View>
      );
    };
  const renderMentionSuggestions = renderSuggestions(agents);

  return (
    <LayoutAnimationConfig skipEntering={true}>
      <Animated.View
        layout={LinearTransition.springify().damping(20).stiffness(120)}
        style={[tailwind.style('flex-1 my-0.5')]}
      >
        <MentionInput
          // @ts-ignore
          ref={textInputRef}
          layout={LinearTransition.springify().damping(20).stiffness(120)}
          onChange={onChangeText}
          partTypes={[
            {
              trigger: '@',
              renderSuggestions: renderMentionSuggestions,
              textStyle: tailwind.style('text-amber-950 font-inter-medium-24'),
              allowedSpacesCount: 0,
              isInsertSpaceAfterMention: true,
            },
          ]}
          maxNumberOfLines={3}
          multiline
          enablesReturnKeyAutomatically
          style={[
            themedTailwind.style(
              'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
              'ml-[5px] mr-2 py-2 pl-3 pr-[36px] rounded-2xl text-gray-950',
              'min-h-9 max-h-[76px]',
              isPrivateMessage ? 'bg-amber-100' : 'bg-gray-100',
            ),
            // TODO: Try settings includeFontPadding to false and have a single lineHeight value of 20
          ]}
          placeholderTextColor={themedTailwind.color('text-gray-400')}
          maxLength={maxLength}
          placeholder={
            isPrivateMessage
              ? `${i18n.t('CONVERSATION.PRIVATE_MSG_INPUT')}`
              : `${i18n.t('CONVERSATION.TYPE_MESSAGE')}`
          }
          onSubmitEditing={() => setMessageContent('')}
          value={messageContent}
          returnKeyType={'default'}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        />
      </Animated.View>
      <Animated.View
        style={[
          // Pre calculated value to position the lock
          tailwind.style('absolute right-13px]'),
          lockIconAnimatedPosition,
        ]}
      >
        <Pressable hitSlop={5} onPress={toggleReplyMode}>
          {isPrivateMessage ? (
            <Icon
              size={29}
              icon={
                <Locked
                  stroke={isDark ? '#FFFFFF' : 'black'}
                  strokeOpacity={isDark ? '1' : '0.565'}
                  fill={isDark ? '#374151' : 'white'}
                />
              }
            />
          ) : (
            <Icon
              size={29}
              icon={
                <Unlock
                  stroke={isDark ? '#FFFFFF' : 'black'}
                  strokeOpacity={isDark ? '1' : '0.565'}
                />
              }
            />
          )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  );
};

const styles = StyleSheet.create({
  listShadow:
    Platform.select({
      ios: {
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 0.15 },
        shadowRadius: 2,
        shadowOpacity: 0.35,
        elevation: 2,
      },
      android: {
        elevation: 4,
        backgroundColor: 'white',
      },
    }) || {}, // Add fallback empty object
});
