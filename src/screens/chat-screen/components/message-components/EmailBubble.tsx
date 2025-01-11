import React from 'react';
import { Animated } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';

import { tailwind } from '@/theme';

import { EmailMeta } from './EmailMeta';
import { Message } from '@/types';
import { MarkdownBubble } from './MarkdownBubble';
import { MESSAGE_TYPES } from '@/constants';

type EmailBubbleProps = {
  item: Message;
  variant: string;
};

export const EmailBubble = (props: EmailBubbleProps) => {
  const messageItem = props.item as Message;
  const { sender, contentAttributes, messageType, content } = messageItem;

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

  return (
    <React.Fragment>
      {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
      <Animated.View style={[tailwind.style('flex  w-full')]}>
        <Animated.View style={tailwind.style('w-full')}>
          {content && isOutgoing ? (
            <MarkdownBubble messageContent={content} variant={props.variant} />
          ) : (
            <AutoHeightWebView
              style={{ width: '100%', minHeight: 1, minWidth: '100%' }}
              scrollEnabled={false}
              customStyle={`
        * {
          font-family: system,-apple-system,".SFNSText-Regular","San Francisco",Roboto,"Segoe UI","Helvetica Neue","Lucida Grande",sans-serif;
          font-size: 16px;
        } 
        img{
          max-width: 100% !important;
        }
      `}
              source={{
                html: FormattedEmail,
              }}
              viewportContent={'width=device-width, user-scalable=no'}
            />
          )}
        </Animated.View>
      </Animated.View>
    </React.Fragment>
  );
};
