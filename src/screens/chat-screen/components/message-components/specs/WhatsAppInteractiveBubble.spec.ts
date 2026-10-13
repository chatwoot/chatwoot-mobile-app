import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { MESSAGE_VARIANTS } from '@/constants';
import { tailwind } from '@/theme';
import { transformMessage } from '@/utils/camelCaseKeys';
import conversationReducer, {
  addConversation,
  addOrUpdateMessage,
} from '@/store/conversation/conversationSlice';
import { conversation } from '@/store/conversation/specs/conversationMockData';

import { getWhatsAppInteractivePresentation } from '../whatsAppInteractivePresentation';
import { WhatsAppInteractiveBubble } from '../WhatsAppInteractiveBubble';
import {
  buttonHeaderVariants,
  buttonMessageEnvelope,
  carouselQuickReplyMessageEnvelope,
  ctaUrlMessageEnvelope,
  inboundButtonReplyEnvelope,
  inboundCarouselReplyEnvelope,
  inboundListReplyEnvelope,
  listMessageEnvelope,
  listOptionalFieldsMessageEnvelope,
  malformedListMessageEnvelope,
  reservedTypeEnvelopes,
  unknownInboundReplyEnvelope,
} from './whatsappInteractiveHandoffFixtures';

jest.mock('@/context', () => ({
  useChatWindowContext: () => ({ conversationId: 401 }),
}));

jest.mock('@/hooks', () => ({
  useAppSelector: () => [],
}));

jest.mock('react-native-reanimated', () => {
  const { Text, View } = jest.requireActual('react-native');
  return { __esModule: true, default: { Text, View } };
});

jest.mock('../MarkdownBubble', () => {
  const ReactModule = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return {
    MarkdownBubble: ({ messageContent }: { messageContent: string }) =>
      ReactModule.createElement(Text, null, messageContent),
  };
});

jest.mock('../MessageAttachments', () => ({ MessageAttachments: () => null }));
jest.mock('../ReplyMessageBubble', () => ({ ReplyMessageBubble: () => null }));

const mockPresentSheet = jest.fn();
jest.mock('@/components-next/common/sheet/Sheet', () => {
  const ReactModule = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    Sheet: ReactModule.forwardRef(
      ({ children }: { children: React.ReactNode }, ref: React.Ref<unknown>) => {
        ReactModule.useImperativeHandle(ref, () => ({
          present: mockPresentSheet,
          dismiss: jest.fn(),
          resize: jest.fn(),
        }));
        return ReactModule.createElement(View, { testID: 'whatsapp-list-sheet' }, children);
      },
    ),
  };
});

const storeMessage = (message: ReturnType<typeof transformMessage>) => {
  let state = conversationReducer(
    undefined,
    addConversation({ ...conversation, id: 401, messages: [] }),
  );
  state = conversationReducer(state, addOrUpdateMessage(message));
  return state.entities[401]?.messages[0];
};

const expectedHeaders: Record<string, object | undefined> = {
  absent: undefined,
  text: { type: 'text', text: 'Choose an action' },
  image: { type: 'image', attachmentId: 501, attachment: { id: 501 } },
  video: { type: 'video', attachmentId: 601, attachment: { id: 601 } },
  document: { type: 'document', attachmentId: 602, attachment: { id: 602 } },
};

describe('WhatsAppInteractiveBubble presentation', () => {
  it('deeply transforms the frozen button envelope and retains it through the store', () => {
    const message = transformMessage(buttonMessageEnvelope);
    expect(message.contentAttributes?.whatsappInteractive).toMatchObject({
      schemaVersion: 1,
      type: 'button',
      header: { type: 'image', attachmentId: 501 },
      action: {
        buttons: [
          {
            deliveryId: 'reply_00000000-0000-4000-8000-000000000001',
            title: 'Confirm',
            presetOptionId: '6ee65bd4-6ef0-4a7c-b5d1-d55ac85b9418',
          },
          {
            deliveryId: 'reply_00000000-0000-4000-8000-000000000002',
            title: 'Change',
            presetOptionId: 'a9ef6905-73b1-4a83-b42d-98c705c7430b',
          },
        ],
      },
      source: { presetId: 9001 },
    });

    expect(storeMessage(message)?.contentAttributes?.whatsappInteractive).toEqual(
      message.contentAttributes?.whatsappInteractive,
    );
  });

  it.each(Object.entries(buttonHeaderVariants))(
    'renders the %s button header while keeping every reply label disabled',
    (name, envelope) => {
      const presentation = getWhatsAppInteractivePresentation(transformMessage(envelope));

      if (name === 'absent') {
        expect(envelope.content_attributes.whatsapp_interactive).not.toHaveProperty('header');
      }

      expect(presentation).toMatchObject({
        kind: 'button',
        header: expectedHeaders[name],
        body: 'Please choose one option.',
        footer: 'Reply once',
        buttons: [
          { title: 'Confirm', disabled: true },
          { title: 'Change', disabled: true },
        ],
      });
    },
  );

  it('omits missing matched header media without losing the body or buttons', () => {
    const presentation = getWhatsAppInteractivePresentation(
      transformMessage({ ...buttonMessageEnvelope, attachments: [] }),
    );

    expect(presentation).toMatchObject({
      kind: 'button',
      header: { type: 'image', attachmentId: 501, attachment: undefined },
      body: 'Please choose one option.',
      buttons: [{ title: 'Confirm' }, { title: 'Change' }],
    });
  });

  it('keeps CTA content, label, and destination readable without response behavior', () => {
    expect(getWhatsAppInteractivePresentation(transformMessage(ctaUrlMessageEnvelope))).toEqual({
      kind: 'cta_url',
      header: { type: 'text', text: 'Order update' },
      body: 'Your order is ready to review.',
      footer: 'Secure link',
      button: 'View details',
      url: 'https://example.test/details',
    });
  });

  it('presents every list section and row in stored order', () => {
    const presentation = getWhatsAppInteractivePresentation(
      transformMessage(listOptionalFieldsMessageEnvelope),
    );

    expect(presentation).toEqual({
      kind: 'list',
      header: { type: 'text', text: 'Available meals' },
      body: 'Choose a meal.',
      footer: 'One selection per order.',
      button: 'View meals',
      sections: [
        {
          title: 'Lunch',
          rows: [
            expect.objectContaining({ title: 'Pasta', description: 'Tomato and basil' }),
            expect.objectContaining({ title: 'Salad' }),
          ],
        },
        {
          rows: [expect.objectContaining({ title: 'Soup' })],
        },
      ],
    });
  });

  it('opens a read-only list sheet with optional text omitted and no row controls', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(listOptionalFieldsMessageEnvelope),
          variant: MESSAGE_VARIANTS.AGENT,
        }),
      );
    });

    const opener = tree!.root.findByProps({ accessibilityLabel: 'View meals' });
    act(() => opener.props.onPress());
    expect(mockPresentSheet).toHaveBeenCalledTimes(1);

    const sheet = tree!.root.findByProps({ testID: 'whatsapp-list-sheet' });
    ['Lunch', 'Pasta', 'Tomato and basil', 'Salad', 'Soup'].forEach(text => {
      expect(sheet.findAll(node => node.children.includes(text)).length).toBeGreaterThan(0);
    });
    expect(sheet.findAll(node => node.props.accessibilityRole === 'button')).toHaveLength(0);
    expect(sheet.findAll(node => node.props.onPress !== undefined)).toHaveLength(0);
  });

  it.each([
    ['empty sections', malformedListMessageEnvelope],
    [
      'future schema',
      {
        ...listMessageEnvelope,
        content_attributes: {
          whatsapp_interactive: {
            ...listMessageEnvelope.content_attributes.whatsapp_interactive,
            schema_version: 2,
          },
        },
      },
    ],
  ])('falls back to readable content for a list with %s', (_name, envelope) => {
    expect(getWhatsAppInteractivePresentation(transformMessage(envelope))).toEqual({
      kind: 'fallback',
      content: 'Choose a meal.',
    });
  });

  it('falls back to readable content for a future schema version with a current type', () => {
    const futureSchemaButton = {
      ...buttonMessageEnvelope,
      content_attributes: {
        whatsapp_interactive: {
          ...buttonMessageEnvelope.content_attributes.whatsapp_interactive,
          schema_version: 2,
        },
      },
    };

    expect(getWhatsAppInteractivePresentation(transformMessage(futureSchemaButton))).toEqual({
      kind: 'fallback',
      content: 'Please choose one option.',
    });
  });

  it('renders reply labels as disabled controls and no active CTA control', () => {
    let buttonTree: TestRenderer.ReactTestRenderer;
    let ctaTree: TestRenderer.ReactTestRenderer;

    act(() => {
      buttonTree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(buttonHeaderVariants.absent),
          variant: MESSAGE_VARIANTS.AGENT,
        }),
      );
      ctaTree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(ctaUrlMessageEnvelope),
          variant: MESSAGE_VARIANTS.AGENT,
        }),
      );
    });

    const findButtonControls = (tree: TestRenderer.ReactTestRenderer) =>
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          node.parent?.props.accessibilityRole !== 'button',
      );
    const replyControls = findButtonControls(buttonTree!);
    expect(replyControls).toHaveLength(2);
    replyControls.forEach(control => {
      expect(control.props.disabled).toBe(true);
      expect(control.props.accessibilityState).toEqual({ disabled: true });
      expect(control.props.onPress).toBeUndefined();
    });
    expect(findButtonControls(ctaTree!)).toHaveLength(0);
  });

  it('uses white auxiliary text on failed interactive message bubbles', () => {
    let buttonTree: TestRenderer.ReactTestRenderer;
    let ctaTree: TestRenderer.ReactTestRenderer;

    act(() => {
      buttonTree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(buttonHeaderVariants.text),
          variant: MESSAGE_VARIANTS.ERROR,
        }),
      );
      ctaTree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(ctaUrlMessageEnvelope),
          variant: MESSAGE_VARIANTS.ERROR,
        }),
      );
    });

    const expectWhiteText = (tree: TestRenderer.ReactTestRenderer, text: string) => {
      const textNodes = tree.root.findAll(
        node => node.children.includes(text) && node.props.style !== undefined,
      );
      expect(
        textNodes.some(
          node => StyleSheet.flatten(node.props.style)?.color === tailwind.color('text-white'),
        ),
      ).toBe(true);
    };

    ['Choose an action', 'Reply once', 'Confirm', 'Change'].forEach(text =>
      expectWhiteText(buttonTree!, text),
    );
    ['Order update', 'Secure link', 'View details', 'https://example.test/details'].forEach(text =>
      expectWhiteText(ctaTree!, text),
    );
  });

  it('deeply transforms and stores populated list and carousel snapshots', () => {
    const listMessage = transformMessage(listMessageEnvelope);
    const carouselMessage = transformMessage(carouselQuickReplyMessageEnvelope);

    expect(listMessage.contentAttributes?.whatsappInteractive).toMatchObject({
      type: 'list',
      action: {
        sections: [
          {
            title: 'Lunch',
            rows: [
              {
                deliveryId: 'row_00000000-0000-4000-8000-000000000001',
                description: 'Tomato and basil',
                presetOptionId: 'd6de08cc-03d3-49f4-9cb6-19d5c76efdf5',
              },
              {
                deliveryId: 'row_00000000-0000-4000-8000-000000000002',
                presetOptionId: 'e8d25cf1-202e-4796-bb8e-1ef173f91f98',
              },
            ],
          },
        ],
      },
    });
    expect(carouselMessage.contentAttributes?.whatsappInteractive).toMatchObject({
      type: 'carousel',
      action: {
        cards: [
          { cardIndex: 0, header: { attachmentId: 504 } },
          {
            cardIndex: 1,
            header: { attachmentId: 505 },
            action: {
              buttons: [
                {
                  deliveryId: 'reply_00000000-0000-4000-8000-000000000103',
                  presetOptionId: '957dd2f4-254f-4a7d-902c-9e89347c69d0',
                },
                {
                  deliveryId: 'reply_00000000-0000-4000-8000-000000000104',
                  presetOptionId: 'cb514b51-57c4-4137-be76-736b2401e711',
                },
              ],
            },
          },
        ],
      },
    });
    expect(storeMessage(listMessage)?.contentAttributes?.whatsappInteractive).toEqual(
      listMessage.contentAttributes?.whatsappInteractive,
    );
    expect(storeMessage(carouselMessage)?.contentAttributes?.whatsappInteractive).toEqual(
      carouselMessage.contentAttributes?.whatsappInteractive,
    );
  });

  it.each([
    [inboundButtonReplyEnvelope, 'Confirm', undefined, undefined],
    [inboundListReplyEnvelope, 'Pasta', 'Tomato and basil', undefined],
    [inboundCarouselReplyEnvelope, 'Choose', undefined, 1],
  ])(
    'retains readable known inbound selections and proven correlation',
    (envelope, title, description, cardIndex) => {
      const message = transformMessage(envelope);
      const presentation = getWhatsAppInteractivePresentation(message);
      const storedReply = storeMessage(message)?.contentAttributes?.whatsappInteractiveReply;

      expect(presentation).toMatchObject({
        kind: 'reply',
        title,
        description,
        deliveryId: envelope.content_attributes.whatsapp_interactive_reply.delivery_id,
        contextId: envelope.content_attributes.whatsapp_interactive_reply.context_id,
        originatingMessageId:
          envelope.content_attributes.whatsapp_interactive_reply.originating_message_id,
        presetOptionId: envelope.content_attributes.whatsapp_interactive_reply.preset_option_id,
        cardIndex,
      });
      expect(storedReply).toEqual(message.contentAttributes?.whatsappInteractiveReply);
    },
  );

  it('does not synthesize preset or card identity for an unknown inbound delivery ID', () => {
    const message = transformMessage(unknownInboundReplyEnvelope);
    const reply = message.contentAttributes?.whatsappInteractiveReply;
    const storedReply = storeMessage(message)?.contentAttributes?.whatsappInteractiveReply;
    const presentation = getWhatsAppInteractivePresentation(message);

    expect(reply?.deliveryId).toBe('reply_unknown_provider_value');
    expect(reply).not.toHaveProperty('presetOptionId');
    expect(reply).not.toHaveProperty('cardIndex');
    expect(storedReply).toEqual(reply);
    expect(storedReply).not.toHaveProperty('presetOptionId');
    expect(storedReply).not.toHaveProperty('cardIndex');
    expect(presentation).toMatchObject({
      kind: 'reply',
      title: 'A provider-only choice',
    });
  });

  it.each(Object.entries(reservedTypeEnvelopes))(
    'keeps the readable fallback for future %s snapshots',
    (_name, envelope) => {
      expect(getWhatsAppInteractivePresentation(transformMessage(envelope))).toEqual({
        kind: 'fallback',
        content: envelope.content,
      });
    },
  );
});
