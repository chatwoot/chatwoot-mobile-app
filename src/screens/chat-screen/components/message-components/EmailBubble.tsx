import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Animated, Pressable, Text } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { StackActions, useNavigation } from '@react-navigation/native';

import i18n from '@/i18n';
import { EmailMeta } from './EmailMeta';
import { Message } from '@/types';
import { MarkdownBubble } from './MarkdownBubble';
import { MessageAttachments } from './MessageAttachments';
import { useIsInDetailPane, useSplitView } from '@/navigation/split/SplitViewContext';
import {
  OPEN_FULL_EMAIL_MESSAGE,
  buildEmailPreviewScript,
  getEmailHtml,
  getEmailStyle,
  isOutgoingMarkdownEmail,
  splitQuotedText,
} from '@/utils/emailUtils';

type EmailBubbleProps = {
  item: Message;
  variant: string;
  orientation?: string;
};

export const EmailBubble = (props: EmailBubbleProps) => {
  const tailwind = useTailwind();
  const navigation = useNavigation();
  const splitView = useSplitView();
  const isInDetailPane = useIsInDetailPane();
  const messageItem = props.item as Message;
  const { sender, contentAttributes, content } = messageItem;
  const isForwarded = !!contentAttributes?.forwardedMessageId;
  const linkLabel = i18n.t('CONVERSATION.EMAIL_HEADER.VIEW_FULL_EMAIL');

  const openFullEmail = () => {
    const params = { conversationId: messageItem.conversationId, messageId: messageItem.id };
    if (isInDetailPane && splitView) {
      splitView.openEmail(params);
      return;
    }
    navigation.dispatch(StackActions.push('EmailMessage', params));
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data.includes(OPEN_FULL_EMAIL_MESSAGE)) {
      openFullEmail();
    }
  };

  const { reply, quoted } = isForwarded
    ? { reply: content, quoted: '' }
    : splitQuotedText(content || '', contentAttributes?.emailQuoteAppended);

  return (
    <React.Fragment>
      {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
      <Animated.View style={[tailwind.style('flex  w-full')]}>
        <Animated.View style={tailwind.style('w-full')}>
          {isOutgoingMarkdownEmail(messageItem) ? (
            <React.Fragment>
              <MarkdownBubble messageContent={reply} variant={props.variant} />
              {!!quoted && (
                <Pressable
                  accessibilityRole="button"
                  onPress={openFullEmail}
                  hitSlop={6}
                  style={tailwind.style('self-start py-1')}>
                  <Text style={tailwind.style('font-inter-medium-24 text-sm text-gray-700')}>
                    {linkLabel}
                  </Text>
                </Pressable>
              )}
            </React.Fragment>
          ) : (
            <AutoHeightWebView
              style={{ width: '100%', minHeight: 1, minWidth: '100%' }}
              scrollEnabled={false}
              forceDarkOn={false}
              autoManageStatusBarEnabled={false}
              customStyle={getEmailStyle(messageItem, tailwind.isDark)}
              customScript={isForwarded ? undefined : buildEmailPreviewScript(linkLabel)}
              onMessage={handleWebViewMessage}
              source={{
                html: getEmailHtml(messageItem),
              }}
              viewportContent={'width=device-width, user-scalable=no'}
            />
          )}
        </Animated.View>
        <MessageAttachments
          item={messageItem}
          variant={props.variant}
          orientation={props.orientation}
          mediaSize="thumbnail"
        />
      </Animated.View>
    </React.Fragment>
  );
};
