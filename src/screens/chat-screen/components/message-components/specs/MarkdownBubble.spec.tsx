import React from 'react';
import { Platform } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { MarkdownBubble } from '../MarkdownBubble';
import { MESSAGE_VARIANTS } from '@/constants';

jest.mock('@/theme/appearance', () => ({ useAppAppearance: () => 'light' }));

describe('MarkdownBubble', () => {
  it('renders standard LTR message content', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <MarkdownBubble messageContent="Hello world" variant={MESSAGE_VARIANTS.AGENT} />,
      );
    });

    const tree = renderer.toJSON();
    expect(tree).toBeTruthy();
    const jsonStr = JSON.stringify(tree);
    expect(jsonStr).toContain('Hello world');
    expect(jsonStr).toContain('writingDirection":"ltr"');
    expect(jsonStr).toContain('textAlign":"left"');
  });

  it('renders multiline Arabic text with RTL styles and proper contrast', () => {
    const arabicMultilineMessage = 'كيف باسوورد \nهذا حسابي حق العمل';
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <MarkdownBubble messageContent={arabicMultilineMessage} variant={MESSAGE_VARIANTS.USER} />,
      );
    });

    const tree = renderer.toJSON();
    expect(tree).toBeTruthy();
    const str = JSON.stringify(tree);
    // Verifies text preservation across linebreaks
    expect(str).toContain('كيف باسوورد');
    expect(str).toContain('هذا حسابي حق العمل');
    // Verifies RTL direction and right alignment
    expect(str).toContain('writingDirection":"rtl"');
    expect(str).toContain('textAlign":"right"');
    // User variant contrast: text-white (#fff)
    expect(str).toContain('color":"#fff"');
  });

  it('renders agent variant with appropriate dark text contrast', () => {
    const arabicMultilineMessage = 'كيف باسوورد \nهذا حسابي حق العمل';
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <MarkdownBubble messageContent={arabicMultilineMessage} variant={MESSAGE_VARIANTS.AGENT} />,
      );
    });

    const tree = renderer.toJSON();
    expect(tree).toBeTruthy();
    const str = JSON.stringify(tree);
    // Agent variant contrast: text-gray-950 (hsl(0, 0%, 12.5%))
    expect(str).toContain('color":"hsl(0, 0%, 12.5%)"');
  });

  it('applies letterSpacing 0 on Android for Arabic text to prevent glyph breakage', () => {
    const originalOS = Platform.OS;
    Platform.OS = 'android';

    try {
      let renderer!: TestRenderer.ReactTestRenderer;
      act(() => {
        renderer = TestRenderer.create(
          <MarkdownBubble
            messageContent="كيف باسوورد \nهذا حسابي حق العمل"
            variant={MESSAGE_VARIANTS.USER}
          />,
        );
      });

      const jsonStr = JSON.stringify(renderer.toJSON());
      expect(jsonStr).toContain('letterSpacing":0');
    } finally {
      Platform.OS = originalOS;
    }
  });

  it('applies letterSpacing 0.32 on iOS or LTR text', () => {
    const originalOS = Platform.OS;
    Platform.OS = 'ios';

    try {
      let renderer!: TestRenderer.ReactTestRenderer;
      act(() => {
        renderer = TestRenderer.create(
          <MarkdownBubble
            messageContent="Hello this is a regular english message"
            variant={MESSAGE_VARIANTS.AGENT}
          />,
        );
      });

      const jsonStr = JSON.stringify(renderer.toJSON());
      expect(jsonStr).toContain('letterSpacing":0.32');
    } finally {
      Platform.OS = originalOS;
    }
  });

  it('renders markdown lists and formatting with RTL styling for Arabic text', () => {
    const markdownArabic = '* العنصر الأول\n* العنصر الثاني';
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <MarkdownBubble messageContent={markdownArabic} variant={MESSAGE_VARIANTS.AGENT} />,
      );
    });

    const tree = renderer.toJSON();
    expect(tree).toBeTruthy();
    const str = JSON.stringify(tree);
    expect(str).toContain('العنصر الأول');
    expect(str).toContain('العنصر الثاني');
    expect(str).toContain('flexDirection":"row-reverse"');
  });
});
