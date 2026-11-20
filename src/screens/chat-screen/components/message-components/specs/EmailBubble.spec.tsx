import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { EmailBubble } from '../EmailBubble';
import { Message } from '@/types';
import { MESSAGE_TYPES, MESSAGE_VARIANTS } from '@/constants';
import i18n from '@/i18n';

const mockTailwindStyle = jest.fn((...args: unknown[]) => ({ styleArgs: args }));

jest.mock('@/theme/useTailwind', () => ({
  useTailwind: () => ({
    style: mockTailwindStyle,
    isDark: false,
    color: () => '#000000',
  }),
}));

jest.mock('react-native-autoheight-webview', () => 'AutoHeightWebView');

jest.mock('../EmailMeta', () => ({
  EmailMeta: 'EmailMeta',
}));

jest.mock('../MessageAttachments', () => ({
  MessageAttachments: 'MessageAttachments',
}));

jest.mock('../MarkdownBubble', () => ({
  MarkdownBubble: 'MarkdownBubble',
}));

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
    locale: 'en',
  },
}));

const createEmailMessage = (overrides?: Record<string, unknown>): Message =>
  ({
    id: 101,
    content: 'Original email plain text',
    messageType: MESSAGE_TYPES.INCOMING,
    contentAttributes: {
      email: {
        subject: 'Email Subject',
        htmlContent: { full: '<p>Original HTML email content</p>' },
        textContent: { full: 'Original email plain text' },
      },
    },
    ...overrides,
  }) as unknown as Message;

describe('EmailBubble', () => {
  beforeEach(() => {
    i18n.locale = 'en';
    mockTailwindStyle.mockClear();
  });

  it('renders AutoHeightWebView when there are no translations for incoming email', () => {
    const item = createEmailMessage();
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<EmailBubble item={item} variant={MESSAGE_VARIANTS.EMAIL} />);
    });

    const webViews = renderer.root.findAll(node => (node.type as string) === 'AutoHeightWebView');
    expect(webViews).toHaveLength(1);
    expect(webViews[0].props.source.html).toBe('<p>Original HTML email content</p>');

    const markdownBubbles = renderer.root.findAll(
      node => (node.type as string) === 'MarkdownBubble',
    );
    expect(markdownBubbles).toHaveLength(0);

    const toggleButtons = renderer.root.findAllByProps({ accessibilityRole: 'button' });
    expect(toggleButtons).toHaveLength(0);
  });

  it('renders MarkdownBubble when there are no translations for outgoing email with content', () => {
    const item = createEmailMessage({
      messageType: MESSAGE_TYPES.OUTGOING,
      content: 'Outgoing email text',
    });
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<EmailBubble item={item} variant={MESSAGE_VARIANTS.EMAIL} />);
    });

    const webViews = renderer.root.findAll(node => (node.type as string) === 'AutoHeightWebView');
    expect(webViews).toHaveLength(0);

    const markdownBubbles = renderer.root.findAll(
      node => (node.type as string) === 'MarkdownBubble',
    );
    expect(markdownBubbles).toHaveLength(1);
    expect(markdownBubbles[0].props.messageContent).toBe('Outgoing email text');

    const toggleButtons = renderer.root.findAllByProps({ accessibilityRole: 'button' });
    expect(toggleButtons).toHaveLength(0);
  });

  it('renders translated text via MarkdownBubble and allows toggling to original content', () => {
    const item = createEmailMessage({
      contentAttributes: {
        email: {
          subject: 'Subject',
          htmlContent: { full: '<p>Original HTML email content</p>' },
          textContent: { full: 'Original email plain text' },
        },
        translations: {
          en: 'Translated email content into English',
        },
      },
    });

    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<EmailBubble item={item} variant={MESSAGE_VARIANTS.EMAIL} />);
    });

    // Initially, translated text is rendered using MarkdownBubble
    const markdownBubbles = renderer.root.findAll(
      node => (node.type as string) === 'MarkdownBubble',
    );
    expect(markdownBubbles).toHaveLength(1);
    expect(markdownBubbles[0].props.messageContent).toBe('Translated email content into English');

    // AutoHeightWebView should NOT be rendered while showing translated text
    expect(
      renderer.root.findAll(node => (node.type as string) === 'AutoHeightWebView'),
    ).toHaveLength(0);

    // Toggle button should be present showing VIEW_ORIGINAL
    const toggleButton = renderer.root.findByProps({ accessibilityRole: 'button' });
    expect(toggleButton).toBeTruthy();

    const toggleText = toggleButton.findByProps({
      children: 'CONVERSATION.VIEW_ORIGINAL',
    });
    expect(toggleText).toBeTruthy();

    // Toggle to view original content
    act(() => {
      toggleButton.props.onPress();
    });

    // Now AutoHeightWebView is shown with original HTML
    const webViews = renderer.root.findAll(node => (node.type as string) === 'AutoHeightWebView');
    expect(webViews).toHaveLength(1);
    expect(webViews[0].props.source.html).toBe('<p>Original HTML email content</p>');

    // Translated MarkdownBubble is gone
    expect(renderer.root.findAll(node => (node.type as string) === 'MarkdownBubble')).toHaveLength(
      0,
    );

    // Toggle button now shows VIEW_TRANSLATED
    expect(
      toggleButton.findByProps({
        children: 'CONVERSATION.VIEW_TRANSLATED',
      }),
    ).toBeTruthy();

    // Toggle back to translated text
    act(() => {
      toggleButton.props.onPress();
    });

    const toggledBackMarkdown = renderer.root.findAll(
      node => (node.type as string) === 'MarkdownBubble',
    );
    expect(toggledBackMarkdown).toHaveLength(1);
    expect(toggledBackMarkdown[0].props.messageContent).toBe(
      'Translated email content into English',
    );
    expect(
      renderer.root.findAll(node => (node.type as string) === 'AutoHeightWebView'),
    ).toHaveLength(0);
  });

  it('falls back to the first available translation if activeLocale is not matched', () => {
    i18n.locale = 'fr';
    const item = createEmailMessage({
      contentAttributes: {
        email: {
          subject: 'Subject',
          htmlContent: { full: '<p>Contenu original</p>' },
        },
        translations: {
          es: 'Contenido traducido al español',
        },
      },
    });

    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<EmailBubble item={item} variant={MESSAGE_VARIANTS.EMAIL} />);
    });

    const markdownBubbles = renderer.root.findAll(
      node => (node.type as string) === 'MarkdownBubble',
    );
    expect(markdownBubbles).toHaveLength(1);
    expect(markdownBubbles[0].props.messageContent).toBe('Contenido traducido al español');
  });

  it('renders translated outgoing email and toggles to original outgoing content', () => {
    const item = createEmailMessage({
      messageType: MESSAGE_TYPES.OUTGOING,
      content: 'Original outgoing message',
      contentAttributes: {
        translations: {
          en: 'Translated outgoing message',
        },
      },
    });

    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<EmailBubble item={item} variant={MESSAGE_VARIANTS.EMAIL} />);
    });

    // Shows translated outgoing content
    let markdownBubbles = renderer.root.findAll(node => (node.type as string) === 'MarkdownBubble');
    expect(markdownBubbles).toHaveLength(1);
    expect(markdownBubbles[0].props.messageContent).toBe('Translated outgoing message');

    const toggleButton = renderer.root.findByProps({ accessibilityRole: 'button' });
    act(() => {
      toggleButton.props.onPress();
    });

    // Shows original outgoing content
    markdownBubbles = renderer.root.findAll(node => (node.type as string) === 'MarkdownBubble');
    expect(markdownBubbles).toHaveLength(1);
    expect(markdownBubbles[0].props.messageContent).toBe('Original outgoing message');
  });

  it('uses textContent formatted with <br> when htmlContent is missing', () => {
    const item = createEmailMessage({
      contentAttributes: {
        email: {
          subject: 'Subject',
          textContent: { full: 'Line 1\nLine 2' },
        },
      },
    });

    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<EmailBubble item={item} variant={MESSAGE_VARIANTS.EMAIL} />);
    });

    const webViews = renderer.root.findAll(node => (node.type as string) === 'AutoHeightWebView');
    expect(webViews).toHaveLength(1);
    expect(webViews[0].props.source.html).toBe('Line 1<br>Line 2');
  });

  it('applies text-blue-200 toggle text color for USER variant and text-blue-700 for EMAIL variant', () => {
    const item = createEmailMessage({
      contentAttributes: {
        translations: {
          en: 'Translated text',
        },
      },
    });

    act(() => {
      TestRenderer.create(<EmailBubble item={item} variant={MESSAGE_VARIANTS.USER} />);
    });
    expect(mockTailwindStyle).toHaveBeenCalledWith(
      'text-xs font-inter-420-20 tracking-[0.32px] pt-1',
      'text-blue-200',
    );

    mockTailwindStyle.mockClear();

    act(() => {
      TestRenderer.create(<EmailBubble item={item} variant={MESSAGE_VARIANTS.EMAIL} />);
    });
    expect(mockTailwindStyle).toHaveBeenCalledWith(
      'text-xs font-inter-420-20 tracking-[0.32px] pt-1',
      'text-blue-700',
    );
  });
});
