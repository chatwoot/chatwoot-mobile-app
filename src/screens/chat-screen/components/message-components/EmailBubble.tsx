import { useTailwind } from '@/theme/useTailwind';
import React, { useState, useCallback } from 'react';
import { Animated, Pressable } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';

import i18n from '@/i18n';
import { EmailMeta } from './EmailMeta';
import { Message } from '@/types';
import { MarkdownBubble } from './MarkdownBubble';
import { MessageAttachments } from './MessageAttachments';
import { MESSAGE_TYPES, MESSAGE_VARIANTS } from '@/constants';

type EmailBubbleProps = {
  item: Message;
  variant: string;
  orientation?: string;
};

export const EmailBubble = (props: EmailBubbleProps) => {
  const tailwind = useTailwind();
  const messageItem = props.item as Message;
  const { sender, contentAttributes, messageType, content } = messageItem;

  const translations = contentAttributes?.translations;
  const activeLocale = i18n.locale?.split('_')[0] || 'en';
  const translatedText = translations
    ? translations[activeLocale] || Object.values(translations)[0] || null
    : null;
  const hasTranslations = !!translatedText;

  const [showOriginal, setShowOriginal] = useState(false);

  const toggleTranslation = useCallback(() => {
    setShowOriginal(prev => !prev);
  }, []);

  const isShowingTranslation = hasTranslations && !showOriginal;

  const emailMessageContent = () => {
    const {
      htmlContent: { full: fullHTMLContent } = { full: undefined },
      textContent: { full: fullTextContent } = { full: undefined },
    } = contentAttributes?.email || {};

    if (fullHTMLContent) {
      return fullHTMLContent;
    }

    if (fullTextContent) {
      return fullTextContent.replace(/\n/g, '<br>');
    }

    return content || '';
  };

  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;

  const FormattedEmail = emailMessageContent().replace('height:100%;', '');

  const baseStyle = `
        * {
          font-family: system,-apple-system,".SFNSText-Regular","San Francisco",Roboto,"Segoe UI","Helvetica Neue","Lucida Grande",sans-serif;
          font-size: 16px;
        }
        img{
          max-width: 100% !important;
        }
      `;
  const lightEmailStyle = `
        :root {
          color-scheme: light;
        }
        html, body {
          background: #ffffff;
          color: #111827;
        }
      `;
  const emailCustomStyle =
    isOutgoing || tailwind.isDark ? `${lightEmailStyle}${baseStyle}` : baseStyle;

  const toggleTextColor =
    props.variant === MESSAGE_VARIANTS.USER ? 'text-blue-200' : 'text-blue-700';

  return (
    <React.Fragment>
      {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
      <Animated.View style={[tailwind.style('flex  w-full')]}>
        <Animated.View style={tailwind.style('w-full')}>
          {isShowingTranslation ? (
            <MarkdownBubble messageContent={translatedText} variant={props.variant} />
          ) : content && isOutgoing ? (
            <MarkdownBubble messageContent={content} variant={props.variant} />
          ) : (
            <AutoHeightWebView
              style={{ width: '100%', minHeight: 1, minWidth: '100%' }}
              scrollEnabled={false}
              forceDarkOn={false}
              autoManageStatusBarEnabled={false}
              customStyle={emailCustomStyle}
              source={{
                html: FormattedEmail,
              }}
              viewportContent={'width=device-width, user-scalable=no'}
            />
          )}
          {hasTranslations && (
            <Pressable onPress={toggleTranslation} hitSlop={4} accessibilityRole="button">
              <Animated.Text
                style={tailwind.style(
                  'text-xs font-inter-420-20 tracking-[0.32px] pt-1',
                  toggleTextColor,
                )}>
                {showOriginal
                  ? i18n.t('CONVERSATION.VIEW_TRANSLATED')
                  : i18n.t('CONVERSATION.VIEW_ORIGINAL')}
              </Animated.Text>
            </Pressable>
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
