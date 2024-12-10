import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Keyboard, TextInput } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useDerivedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChatWindowContext, useRefsContext } from '@/context';
import {
  useHaptic,
  isAWhatsAppChannel,
  is360DialogWhatsAppChannel,
  isATwilioWhatsAppChannel,
  isAWhatsAppCloudChannel,
  isAnEmailChannel,
  isASmsInbox,
  isAFacebookInbox,
  isALineChannel,
  isATelegramChannel,
  isAWebWidgetInbox,
} from '@/utils';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { MESSAGE_MAX_LENGTH, REPLY_EDITOR_MODES } from '@/constants';
import { tailwind } from '@/theme';
import {
  selectMessageContent,
  selectAttachments,
  selectQuoteMessage,
  resetSentMessage,
  selectIsPrivateMessage,
  togglePrivateMessage,
  setMessageContent,
} from '@/store/conversation/sendMessageSlice';
import { selectUserId, selectUserThumbnail } from '@/store/auth/authSelectors';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';

import { AddCommandButton } from './buttons/AddCommandButton';
import { SendMessageButton } from './buttons/SendMessageButton';
import { MessageTextInput } from './MessageTextInput';
import { QuoteReply } from './QuoteReply';
import { ReplyWarning } from './ReplyWarning';
import { CannedResponses } from './CannedResponses';
import { AttachedMedia } from '../message-components/AttachedMedia';
import { CommandOptionsMenu } from '../message-components/CommandOptionsMenu';
import { SendMessagePayload } from '@/store/conversation/conversationTypes';
import { TypingIndicator } from './TypingIndicator';
import { getTypingUsersText } from '@/utils';
import { selectTypingUsersByConversationId } from '@/store/conversation/conversationTypingSlice';
import { CannedResponse, Contact, Conversation } from '@/types';
import AnalyticsHelper from '@/helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from '@/constants/analyticsEvents';
import {
  allMessageVariables,
  replaceMessageVariables,
  getAllUndefinedVariablesInMessage,
} from '@/utils/messageVariableUtils';

const SHEET_APPEAR_SPRING_CONFIG = {
  damping: 20,
  stiffness: 120,
};

// TODO: Implement this
// const globalConfig = {
//   directUploadsEnabled: true,
// };

const AnimatedKeyboardStickyView = Animated.createAnimatedComponent(KeyboardStickyView);
const BottomSheetContent = () => {
  const hapticSelection = useHaptic();
  const dispatch = useAppDispatch();
  const { bottom } = useSafeAreaInsets();
  const { messageListRef } = useRefsContext();

  // Selectors
  const userId = useAppSelector(selectUserId);
  const userThumbnail = useAppSelector(selectUserThumbnail);
  const messageContent = useAppSelector(selectMessageContent);
  const attachedFiles = useAppSelector(selectAttachments);
  const quoteMessage = useAppSelector(selectQuoteMessage);
  const isPrivate = useAppSelector(selectIsPrivateMessage);

  // Context
  const {
    isAddMenuOptionSheetOpen,
    setAddMenuOptionSheetState,
    textInputRef,
    isTextInputFocused,
    conversationId,
  } = useChatWindowContext();

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const { inboxId, canReply } = conversation || {};
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : undefined));

  const [replyEditorMode, setReplyEditorMode] = useState(REPLY_EDITOR_MODES.REPLY);
  const [ccEmails, setCCEmails] = useState('');
  const [bccEmails, setBCCEmails] = useState('');
  const [toEmails, setToEmails] = useState('');
  const [selectedCannedResponse, setSelectedCannedResponse] = useState<string | null>(null);

  const typingUsers = useAppSelector(selectTypingUsersByConversationId(conversationId));
  const typingText = useMemo(() => getTypingUsersText({ users: typingUsers }), [typingUsers]);

  const attachmentsLength = useMemo(() => attachedFiles.length, [attachedFiles.length]);

  // Show reply header form if it's an email channel and not on a private note
  const showReplyHeader = inbox && isAnEmailChannel(inbox) && !isPrivate;

  const messageVariables = allMessageVariables({
    conversation: conversation as Conversation,
    contact: conversation?.meta?.sender as Contact,
  });

  useEffect(() => {
    if (canReply || (inbox && isAWhatsAppChannel(inbox))) {
      setReplyEditorMode(REPLY_EDITOR_MODES.REPLY);
      dispatch(togglePrivateMessage(false));
    } else {
      setReplyEditorMode(REPLY_EDITOR_MODES.NOTE);
      dispatch(togglePrivateMessage(true));
    }
  }, [inbox, canReply, dispatch]);

  const derivedAddMenuOptionStateValue = useDerivedValue(() => {
    return isAddMenuOptionSheetOpen
      ? withSpring(1, SHEET_APPEAR_SPRING_CONFIG)
      : withSpring(0, SHEET_APPEAR_SPRING_CONFIG);
  });

  const animatedInputWrapperStyle = useAnimatedStyle(
    () => ({
      marginBottom: isTextInputFocused ? 0 : bottom,
    }),
    [isTextInputFocused],
  );

  const handleShowAddMenuOption = () => {
    if (isAddMenuOptionSheetOpen) {
      hapticSelection?.();
      setAddMenuOptionSheetState(false);
    } else {
      Keyboard.dismiss();
      hapticSelection?.();
      setAddMenuOptionSheetState(true);
    }
  };

  // TODO: Implement this
  const sendMessageAsMultipleMessages = (message: string) => {
    console.log('sendMessageAsMultipleMessages', message);
  };

  // TODO: Implement this
  const setReplyToInPayload = (messagePayload: any) => {
    //     ...(quoteMessage?.id && {
    //       contentAttributes: { inReplyTo: quoteMessage.id },
    //     }),
    return messagePayload;
  };

  const getMessagePayload = (message: string) => {
    // TODO: Update mentions if the message is private
    // if (isPrivate) {
    //   const regex = /@\[([\w\s]+)\]\((\d+)\)/g;
    //   updatedMessage = message.replace(
    //     regex,
    //     '[@$1](mention://user/$2/' + encodeURIComponent('$1') + ')',
    //   );
    // }

    let messagePayload = {
      conversationId,
      message,
      private: isPrivate,
      sender: {
        id: userId ?? 0,
        thumbnail: userThumbnail ?? '',
      },
      files: [],
    } as SendMessagePayload;
    messagePayload = setReplyToInPayload(messagePayload);

    if (attachedFiles && attachedFiles.length) {
      // messagePayload.files = [];
      // TODO: Implement this
      // attachedFiles.forEach(attachment => {
      //   if (globalConfig.directUploadsEnabled) {
      //     messagePayload.files.push(attachment.blobSignedId);
      //   } else {
      //     messagePayload.files.push(attachment.resource.file);
      //   }
      // });
      // TODO: Add support for multiple files later
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      messagePayload.file = attachedFiles[0];
    }

    // TODO: Implement this
    if (ccEmails && !isPrivate) {
      messagePayload.ccEmails = ccEmails;
    }

    if (bccEmails && !isPrivate) {
      messagePayload.bccEmails = bccEmails;
    }

    if (toEmails && !isPrivate) {
      messagePayload.toEmails = toEmails;
    }

    return messagePayload;
  };

  const confirmOnSendReply = () => {
    hapticSelection?.();
    if (textInputRef && 'current' in textInputRef && textInputRef.current) {
      (textInputRef.current as TextInput).clear();
    }

    const isOnWhatsApp =
      isATwilioWhatsAppChannel(inbox) ||
      isAWhatsAppCloudChannel(inbox) ||
      is360DialogWhatsAppChannel(inbox?.channelType);

    AnalyticsHelper.track(CONVERSATION_EVENTS.SENT_MESSAGE);

    const undefinedVariables = getAllUndefinedVariablesInMessage({
      message: messageContent,
      variables: messageVariables,
    });

    if (undefinedVariables.length > 0) {
      const undefinedVariablesCount = undefinedVariables.length > 1 ? undefinedVariables.length : 1;
      const undefinedVariablesText = undefinedVariables.join(', ');
      const undefinedVariablesMessage = `You have ${undefinedVariablesCount} undefined variable(s) in your message: ${undefinedVariablesText}. Please check and try again with valid variables.`;
      Alert.alert(undefinedVariablesMessage);
    } else if (isOnWhatsApp && !isPrivate) {
      sendMessageAsMultipleMessages(messageContent);
    } else {
      const messagePayload = getMessagePayload(messageContent);
      sendMessage(messagePayload);
    }
  };

  const sendMessage = (messagePayload: SendMessagePayload) => {
    dispatch(conversationActions.sendMessage(messagePayload));
    dispatch(resetSentMessage());
    setSelectedCannedResponse(null);
    dispatch(setMessageContent(''));
    setCCEmails('');
    setBCCEmails('');
    setToEmails('');
    messageListRef?.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const shouldShowFileUpload =
    inbox &&
    (isAWebWidgetInbox(inbox) ||
      isAFacebookInbox(inbox) ||
      isATwilioWhatsAppChannel(inbox) ||
      isASmsInbox(inbox) ||
      isAnEmailChannel(inbox) ||
      isATelegramChannel(inbox) ||
      isALineChannel(inbox));

  const maxLength = () => {
    if (isPrivate) {
      return MESSAGE_MAX_LENGTH.GENERAL;
    }
    if (isAFacebookInbox(inbox)) {
      return MESSAGE_MAX_LENGTH.FACEBOOK;
    }
    if (isAWhatsAppChannel(inbox)) {
      return MESSAGE_MAX_LENGTH.TWILIO_WHATSAPP;
    }
    if (isASmsInbox(inbox)) {
      return MESSAGE_MAX_LENGTH.TWILIO_SMS;
    }
    if (isAnEmailChannel(inbox)) {
      return MESSAGE_MAX_LENGTH.EMAIL;
    }
    return MESSAGE_MAX_LENGTH.GENERAL;
  };

  const onSelectCannedResponse = (cannedResponse: CannedResponse) => {
    const updatedContent = replaceMessageVariables({
      message: cannedResponse.content,
      variables: messageVariables,
    });
    AnalyticsHelper.track(CONVERSATION_EVENTS.INSERTED_A_CANNED_RESPONSE);
    setSelectedCannedResponse(updatedContent);
  };

  const shouldShowCannedResponses = messageContent?.charAt(0) === '/';

  return (
    <Animated.View layout={LinearTransition.springify().damping(38).stiffness(240)}>
      <AnimatedKeyboardStickyView style={[tailwind.style('bg-white'), animatedInputWrapperStyle]}>
        {!canReply && inbox && conversation && (
          <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(10)}>
            <ReplyWarning inbox={inbox} conversation={conversation} />
          </Animated.View>
        )}
        {shouldShowCannedResponses && (
          <CannedResponses searchKey={messageContent} onSelect={onSelectCannedResponse} />
        )}

        <Animated.View
          layout={LinearTransition.springify().damping(38).stiffness(240)}
          style={tailwind.style('py-2 border-t-[1px] border-t-blackA-A3')}>
          {quoteMessage && (
            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(10)}>
              <QuoteReply />s
            </Animated.View>
          )}

          {typingText && <TypingIndicator typingText={typingText} />}

          <Animated.View style={tailwind.style('flex flex-row px-1 items-end z-20 relative')}>
            {attachmentsLength === 0 && shouldShowFileUpload && (
              <AddCommandButton
                onPress={handleShowAddMenuOption}
                derivedAddMenuOptionStateValue={derivedAddMenuOptionStateValue}
              />
            )}
            <MessageTextInput
              maxLength={maxLength()}
              replyEditorMode={replyEditorMode}
              selectedCannedResponse={selectedCannedResponse}
            />
            {(messageContent.length > 0 || attachmentsLength > 0) && (
              <SendMessageButton onPress={confirmOnSendReply} />
            )}
          </Animated.View>
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

export const ReplyBoxContainer = () => {
  return <BottomSheetContent />;
};
