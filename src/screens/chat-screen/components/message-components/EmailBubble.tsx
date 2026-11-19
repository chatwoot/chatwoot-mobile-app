import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Animated } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';

import { EmailMeta } from './EmailMeta';
import { Message } from '@/types';
import { MarkdownBubble } from './MarkdownBubble';
import { MessageAttachments } from './MessageAttachments';
import { MESSAGE_TYPES } from '@/constants';

type EmailBubbleProps = {
  item: Message;
  variant: string;
  orientation?: string;
};

export const EmailBubble = (props: EmailBubbleProps) => {
  const tailwind = useTailwind();
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

  const baseStyle = `
        * {
          font-family: system,-apple-system,".SFNSText-Regular","San Francisco",Roboto,"Segoe UI","Helvetica Neue","Lucida Grande",sans-serif;
          font-size: 16px;
        }
        img{
          max-width: 100% !important;
        }
      `;
  const outgoingReadableStyle = `
        :root {
          color-scheme: light;
        }
        html, body {
          background: #ffffff;
          color: #111827;
        }
      `;
  const darkIncomingStyle = `
        :root {
          color-scheme: dark;
        }
        html, body {
          color: ${tailwind.color('text-gray-950')};
        }
      `;
  // Email HTML often sets dark text colours inline; on the dark bubble only the text
  // that sits on a transparent or dark background is lightened.
  const darkReadableScript = `
        (function () {
          var parse = function (value) {
            var match = value.match(/rgba?\\(([^)]+)\\)/);
            if (!match) return null;
            var parts = match[1].split(',').map(Number);
            var alpha = parts.length > 3 ? parts[3] : 1;
            return { luminance: (0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2]) / 255, alpha: alpha };
          };
          var backgroundLuminance = function (element) {
            for (var node = element; node && node.nodeType === 1; node = node.parentElement) {
              var background = parse(getComputedStyle(node).backgroundColor);
              if (background && background.alpha > 0) return background.luminance;
            }
            return 0;
          };
          document.querySelectorAll('body, body *').forEach(function (element) {
            var color = parse(getComputedStyle(element).color);
            if (!color || color.luminance >= 0.5 || backgroundLuminance(element) >= 0.5) return;
            var isLink = element.closest('a');
            element.style.setProperty('color', isLink ? '${tailwind.color('text-blue-800')}' : '${tailwind.color('text-gray-950')}', 'important');
          });
        })();
      `;
  const emailCustomStyle = isOutgoing
    ? `${outgoingReadableStyle}${baseStyle}`
    : tailwind.isDark
      ? `${darkIncomingStyle}${baseStyle}`
      : baseStyle;

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
              forceDarkOn={false}
              autoManageStatusBarEnabled={false}
              customStyle={emailCustomStyle}
              customScript={!isOutgoing && tailwind.isDark ? darkReadableScript : undefined}
              source={{
                html: FormattedEmail,
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
