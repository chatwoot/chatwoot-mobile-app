import { MESSAGE_TYPES } from '@/constants';
import { Message } from '@/types';

const QUOTE_CLASS = 'cw-quote';
const FULL_EMAIL_LINK_CLASS = 'cw-full-email-link';

export const OPEN_FULL_EMAIL_MESSAGE = 'open-full-email';

const BASE_EMAIL_STYLE = `
  * {
    font-family: system,-apple-system,".SFNSText-Regular","San Francisco",Roboto,"Segoe UI","Helvetica Neue","Lucida Grande",sans-serif;
    font-size: 16px;
  }
  img {
    max-width: 100% !important;
  }
  blockquote {
    margin: 0 0 0 0.8ex;
    padding-left: 1ex;
    border-left: 1px solid #cccccc;
  }
  .${QUOTE_CLASS} {
    display: none !important;
  }
  .${FULL_EMAIL_LINK_CLASS} {
    display: block;
    margin: 12px 0 4px;
    padding: 4px 0;
    border: 0;
    background: none;
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
  }
`;

const LIGHT_EMAIL_STYLE = `
  :root {
    color-scheme: light;
  }
  html, body {
    background: #ffffff;
    color: #111827;
  }
`;

export const isOutgoingMarkdownEmail = (message: Message) =>
  !!message.content && message.messageType === MESSAGE_TYPES.OUTGOING;

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const getEmailHtml = (message: Message) => {
  const email = message.contentAttributes?.email;
  const html = email?.htmlContent?.full;
  const text = email?.textContent?.full;
  const content =
    html || (text && escapeHtml(text).replace(/\n/g, '<br>')) || message.content || '';
  return content.replace('height:100%;', '');
};

export const getEmailStyle = (message: Message, isDark: boolean) =>
  message.messageType === MESSAGE_TYPES.OUTGOING || isDark
    ? `${LIGHT_EMAIL_STYLE}${BASE_EMAIL_STYLE}`
    : BASE_EMAIL_STYLE;

const APPENDED_THREAD = /^> On [^\n]* wrote:(?:\n>[^\n]*)*\s*(?![\s\S])/m;

/**
 * Splits an outgoing email reply into the agent's text and the thread the
 * email reply box appended after it: a trailing "> On … wrote:" line followed
 * only by "> " lines. Nothing is split when the reply box reports that it
 * appended no thread, or when no text precedes the thread.
 */
export const splitQuotedText = (text: string, quoteAppended?: boolean) => {
  const thread = quoteAppended === false ? null : APPENDED_THREAD.exec(text);
  const reply = thread ? text.slice(0, thread.index).trimEnd() : '';

  if (!thread || !reply.trim()) {
    return { reply: text, quoted: '' };
  }

  return { reply, quoted: text.slice(thread.index) };
};

/**
 * Script for an email preview WebView that hides everything from the first
 * quoted block to the end of the email and puts a link to the full email where
 * the quote starts.
 */
export const buildEmailPreviewScript = (linkLabel: string) => String.raw`
  (function () {
    var LINK_LABEL = ${JSON.stringify(linkLabel)};
    var THREAD_CONTAINER_SELECTORS = [
      '.gmail_quote_container',
      '.gmail_quote',
      '#divRplyFwdMsg',
      '#appendonsend',
      '.OutlookQuote',
      '.moz-cite-prefix',
      '.yahoo_quoted',
      '.protonmail_quote',
    ].join(', ');
    var ATTRIBUTION_END = /(wrote|schrieb|a écrit|escribió|ha scritto|escreveu|schreef)\s*:\s*$/i;
    var QUOTE_LINE_START = /^\s*(On\s.+\s(wrote|schrieb)\s*:|Am\s.+schrieb.*:|-{2,}\s*Original Message)/i;
    var IGNORED_TEXT_PARENTS = /^(SCRIPT|STYLE)$/;
    var PLAIN_QUOTE_LINE_START = /^\s*>/;
    var LINE_BREAK_TAGS = /^(DIV|P|BLOCKQUOTE|TABLE|UL|OL|LI|HR)$/;
    var RICH_CONTENT_SELECTORS = 'div, p, span, font, a, table, blockquote';
    var REPLY_ATTRIBUTION_START = /^\s*(On\s.+\s(wrote|schrieb)\s*:|Am\s.+schrieb.*:)/i;
    var HEADER_STYLE_SELECTORS = '#divRplyFwdMsg, #appendonsend';
    var HEADER_BLOCK_START = /^\s*(-{2,}\s*Original Message|From:[\s\S]*(Sent|Date):)/i;
    var FORWARD_START = /^\s*(-{2,}\s*Forwarded message|Begin forwarded message\s*:)/i;

    function textOf(node) {
      return (node.textContent || '').trim();
    }

    function isBlank(node) {
      return (node.nodeType === Node.TEXT_NODE && !textOf(node)) || node.nodeName === 'BR';
    }

    function isInQuote(node) {
      return !!node.parentElement.closest(THREAD_CONTAINER_SELECTORS + ', blockquote');
    }

    function hasReplyAfter(node) {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (var text = walker.nextNode(); text; text = walker.nextNode()) {
        if (
          node.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING &&
          !node.contains(text) &&
          !IGNORED_TEXT_PARENTS.test(text.parentNode.nodeName) &&
          text.textContent.trim() &&
          !PLAIN_QUOTE_LINE_START.test(text.textContent) &&
          !isInQuote(text)
        ) {
          return true;
        }
      }
      return false;
    }

    var FORWARDS = Array.prototype.filter.call(
      document.body.querySelectorAll(THREAD_CONTAINER_SELECTORS + ', blockquote'),
      function (node) {
        return FORWARD_START.test(textOf(node));
      },
    );

    function isForwarded(node) {
      return FORWARDS.some(function (forward) {
        return forward.contains(node);
      });
    }

    function firstQuoteContainer() {
      var candidates = document.body.querySelectorAll(THREAD_CONTAINER_SELECTORS + ', blockquote');
      for (var i = 0; i < candidates.length; i += 1) {
        var candidate = candidates[i];
        if (
          isForwarded(candidate) ||
          (!candidate.matches(HEADER_STYLE_SELECTORS) && hasReplyAfter(candidate))
        ) {
          continue;
        }
        return includeAttribution(candidate);
      }
      return null;
    }

    function firstHeaderBlock() {
      var blocks = document.body.querySelectorAll('div, p');
      for (var i = 0; i < blocks.length; i += 1) {
        if (!isForwarded(blocks[i]) && HEADER_BLOCK_START.test(textOf(blocks[i]))) {
          return blocks[i];
        }
      }
      return null;
    }

    function isLineBreak(node) {
      return !node || node.nodeName === 'BR' || LINE_BREAK_TAGS.test(node.nodeName);
    }

    function lineEnd(node) {
      var end = node;
      while (!isLineBreak(end.nextSibling)) {
        end = end.nextSibling;
      }
      return end;
    }

    function lineText(node) {
      var text = '';
      for (var current = node; !isLineBreak(current); current = current.nextSibling) {
        text += current.textContent;
      }
      return text;
    }

    function firstQuoteLine() {
      var isPlainText = !document.body.querySelector(RICH_CONTENT_SELECTORS);
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (var node = walker.nextNode(); node; node = walker.nextNode()) {
        if (
          node.parentNode.nodeName === 'SCRIPT' ||
          !isLineBreak(node.previousSibling) ||
          isForwarded(node)
        ) {
          continue;
        }
        var text = lineText(node);
        if (QUOTE_LINE_START.test(text)) {
          if (REPLY_ATTRIBUTION_START.test(text) && hasReplyAfter(lineEnd(node))) {
            continue;
          }
          return node;
        }
        if (isPlainText && PLAIN_QUOTE_LINE_START.test(text) && onlyQuotedLinesFrom(node)) {
          return node;
        }
      }
      return null;
    }

    function onlyQuotedLinesFrom(node) {
      for (var current = node; current; current = current.nextSibling) {
        if (current.nodeType !== Node.TEXT_NODE || !isLineBreak(current.previousSibling)) {
          continue;
        }
        var text = lineText(current);
        if (text.trim() && !PLAIN_QUOTE_LINE_START.test(text)) {
          return false;
        }
      }
      return true;
    }

    function previousContent(node) {
      var previous = node.previousSibling;
      while (previous && isBlank(previous)) {
        previous = previous.previousSibling;
      }
      return previous;
    }

    function includeAttribution(node) {
      var start = node;
      var previous = previousContent(start);
      while (!previous && start.parentNode !== document.body) {
        start = start.parentNode;
        previous = previousContent(start);
      }
      if (previous && (previous.nodeName === 'HR' || ATTRIBUTION_END.test(textOf(previous)))) {
        return previous;
      }
      return node;
    }

    function earliest(nodes) {
      return nodes.filter(Boolean).reduce(function (first, node) {
        if (!first) {
          return node;
        }
        return first.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING ? node : first;
      }, null);
    }

    function hasContentBefore(node) {
      var range = document.createRange();
      range.setStart(document.body, 0);
      range.setEndBefore(node);
      return !!range.toString().trim() || !!range.cloneContents().querySelector('img');
    }

    function hideFrom(boundary) {
      var nodes = [boundary];
      for (var current = boundary; current !== document.body; current = current.parentNode) {
        for (var sibling = current.nextSibling; sibling; sibling = sibling.nextSibling) {
          nodes.push(sibling);
        }
      }
      var hidden = nodes.map(function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          var wrapper = document.createElement('span');
          node.parentNode.insertBefore(wrapper, node);
          wrapper.appendChild(node);
          node = wrapper;
        }
        if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT') {
          node.classList.add('${QUOTE_CLASS}');
        }
        return node;
      });
      return hidden[0];
    }

    function insertFullEmailLink(firstHidden) {
      var link = document.createElement('button');
      link.type = 'button';
      link.className = '${FULL_EMAIL_LINK_CLASS}';
      link.textContent = LINK_LABEL;
      link.addEventListener('click', function () {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${OPEN_FULL_EMAIL_MESSAGE}' }));
      });
      firstHidden.parentNode.insertBefore(link, firstHidden);
    }

    var boundary = earliest([firstQuoteContainer(), firstHeaderBlock(), firstQuoteLine()]);
    if (boundary && hasContentBefore(boundary)) {
      insertFullEmailLink(hideFrom(boundary));
    }
  })();
`;
